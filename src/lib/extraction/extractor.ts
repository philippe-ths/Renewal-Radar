import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { emails, renewals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { buildExtractionPrompt } from "./prompts";
import { extractPdfText } from "./pdf";
import { computeStatus } from "@/lib/utils/dates";
import type { ExtractionResult } from "./types";

const anthropic = new Anthropic();

async function extractFromEmail(
  emailRow: typeof emails.$inferSelect
): Promise<ExtractionResult | null> {
  let pdfText: string | undefined;

  if (emailRow.hasPdf && emailRow.pdfFilename) {
    try {
      pdfText = await extractPdfText(emailRow.id, emailRow.pdfFilename);
    } catch (e) {
      console.error(`PDF extraction failed for ${emailRow.id}:`, e);
    }
  }

  // Store PDF text if extracted
  if (pdfText) {
    db.update(emails)
      .set({ pdfText })
      .where(eq(emails.id, emailRow.id))
      .run();
  }

  const prompt = buildExtractionPrompt(
    emailRow.subject || "",
    emailRow.bodyText || "",
    pdfText
  );

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]) as ExtractionResult;
  } catch {
    console.error("Failed to parse extraction JSON:", responseText);
    return null;
  }
}

export async function processUnextractedEmails(): Promise<{
  processed: number;
  renewalsFound: number;
}> {
  const unprocessed = db
    .select()
    .from(emails)
    .where(eq(emails.processed, false))
    .all();

  let renewalsFound = 0;

  for (const email of unprocessed) {
    try {
      const result = await extractFromEmail(email);

      if (result && result.is_renewal) {
        const status = result.renewal_date
          ? computeStatus(result.renewal_date)
          : "upcoming";

        db.insert(renewals)
          .values({
            id: uuidv4(),
            emailId: email.id,
            category: result.category,
            provider: result.provider,
            policyNumber: result.policy_number,
            renewalDate: result.renewal_date,
            premiumAnnual: result.premium_annual,
            premiumMonthly: result.premium_monthly,
            currency: result.currency || "GBP",
            status,
            rawExtraction: JSON.stringify(result),
            evidenceCategory: result.evidence.category,
            evidenceProvider: result.evidence.provider,
            evidencePolicy: result.evidence.policy_number,
            evidenceDate: result.evidence.renewal_date,
            evidencePremium: result.evidence.premium,
          })
          .run();

        renewalsFound++;
      }

      // Mark email as processed
      db.update(emails)
        .set({ processed: true })
        .where(eq(emails.id, email.id))
        .run();
    } catch (error) {
      console.error(`Extraction failed for email ${email.id}:`, error);
    }
  }

  return { processed: unprocessed.length, renewalsFound };
}
