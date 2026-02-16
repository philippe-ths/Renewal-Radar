import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { renewals, renewalPacks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { formatGBP } from "@/lib/utils/currency";

const anthropic = new Anthropic();

export async function generateRenewalPack(renewalId: string): Promise<{
  id: string;
  content: string;
} | null> {
  const renewal = db
    .select()
    .from(renewals)
    .where(eq(renewals.id, renewalId))
    .get();

  if (!renewal) return null;

  const prompt = `You are helping a UK consumer prepare for an insurance renewal negotiation. Generate a comprehensive renewal pack based on these details:

- Category: ${renewal.category || "Unknown"}
- Provider: ${renewal.provider || "Unknown"}
- Policy Number: ${renewal.policyNumber || "Not available"}
- Renewal Date: ${renewal.renewalDate || "Unknown"}
- Annual Premium: ${formatGBP(renewal.premiumAnnual)}
- Monthly Premium: ${renewal.premiumMonthly ? formatGBP(renewal.premiumMonthly) : "N/A"}

Generate a renewal pack with exactly these 5 sections:

## 1. Summary of Current Renewal Terms
Summarise the key terms of the renewal in plain English. Note what the consumer is paying and when the policy renews.

## 2. Comparison Quote Checklist
A checklist of information the consumer needs to gather to get accurate comparison quotes from other providers. Include:
- Cover type and level
- Excess amounts
- Key add-ons to check
- Personal details that affect pricing

## 3. Comparison Template
A simple template the consumer can fill in when comparing quotes from different providers. Format as a table with columns for Provider, Annual Premium, Monthly Premium, Excess, Key Cover Details, and Notes.

## 4. Negotiation Script
A practical phone script or email draft the consumer can use to call their current provider and negotiate a better price. Reference UK-specific points:
- FCA rules on fair pricing
- Cooling-off period rights (14 days)
- Loyal customer argument
- Competitor quotes as leverage

## 5. Questions to Confirm
A list of specific questions to ask the provider to ensure the policy is right:
- Excess amounts
- Key exclusions
- Add-on coverage
- Claims process
- Cancellation terms

Keep the tone practical and actionable. Use British English throughout.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content =
    message.content[0].type === "text" ? message.content[0].text : "";

  if (!content) return null;

  const id = uuidv4();

  db.insert(renewalPacks)
    .values({
      id,
      renewalId,
      content,
    })
    .run();

  return { id, content };
}
