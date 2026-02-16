import { google, gmail_v1 } from "googleapis";
import { getAuthenticatedClient } from "./auth";
import { db } from "@/lib/db";
import { emails } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildSearchQuery } from "./queries";
import fs from "fs";
import path from "path";

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

function extractBody(payload: gmail_v1.Schema$MessagePart): string {
  // Direct body
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Multipart - look for text/plain first, then text/html
  if (payload.parts) {
    const textPart = payload.parts.find((p) => p.mimeType === "text/plain");
    if (textPart?.body?.data) {
      return decodeBase64Url(textPart.body.data);
    }

    const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");
    if (htmlPart?.body?.data) {
      const html = decodeBase64Url(htmlPart.body.data);
      // Strip HTML tags for plain text
      return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    // Nested multipart
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }
  }

  return "";
}

function findPdfAttachments(
  payload: gmail_v1.Schema$MessagePart
): Array<{ filename: string; attachmentId: string }> {
  const pdfs: Array<{ filename: string; attachmentId: string }> = [];

  if (
    payload.filename &&
    payload.filename.toLowerCase().endsWith(".pdf") &&
    payload.body?.attachmentId
  ) {
    pdfs.push({
      filename: payload.filename,
      attachmentId: payload.body.attachmentId,
    });
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      pdfs.push(...findPdfAttachments(part));
    }
  }

  return pdfs;
}

export async function searchEmails(
  query?: string,
  maxResults: number = 50
): Promise<string[]> {
  const auth = await getAuthenticatedClient();
  if (!auth) throw new Error("Gmail not connected");

  const gmail = google.gmail({ version: "v1", auth });
  const searchQuery = query || buildSearchQuery();

  const res = await gmail.users.messages.list({
    userId: "me",
    q: searchQuery,
    maxResults,
  });

  return (res.data.messages || []).map((m) => m.id!);
}

export async function fetchAndStoreEmail(messageId: string): Promise<boolean> {
  // Skip if already stored
  const existing = db.select().from(emails).where(eq(emails.id, messageId)).get();
  if (existing) return false;

  const auth = await getAuthenticatedClient();
  if (!auth) throw new Error("Gmail not connected");

  const gmail = google.gmail({ version: "v1", auth });
  const msg = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const headers = msg.data.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

  const bodyText = extractBody(msg.data.payload!);
  const pdfAttachments = findPdfAttachments(msg.data.payload!);
  const hasPdf = pdfAttachments.length > 0;

  let pdfFilename: string | null = null;
  if (hasPdf) {
    // Download first PDF attachment
    const pdf = pdfAttachments[0];
    pdfFilename = pdf.filename;

    const attachment = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId,
      id: pdf.attachmentId,
    });

    if (attachment.data.data) {
      const attachDir = path.join(process.cwd(), "data", "attachments");
      if (!fs.existsSync(attachDir)) {
        fs.mkdirSync(attachDir, { recursive: true });
      }

      const filePath = path.join(attachDir, `${messageId}_${pdf.filename}`);
      const buffer = Buffer.from(
        attachment.data.data.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      );
      fs.writeFileSync(filePath, buffer);
    }
  }

  db.insert(emails)
    .values({
      id: messageId,
      threadId: msg.data.threadId || null,
      subject: getHeader("Subject"),
      fromAddress: getHeader("From"),
      date: getHeader("Date"),
      snippet: msg.data.snippet || null,
      bodyText,
      hasPdf,
      pdfFilename,
      processed: false,
    })
    .run();

  return true;
}

export async function syncEmails(): Promise<{
  found: number;
  newEmails: number;
}> {
  const messageIds = await searchEmails();
  let newEmails = 0;

  for (const id of messageIds) {
    const isNew = await fetchAndStoreEmail(id);
    if (isNew) newEmails++;
  }

  return { found: messageIds.length, newEmails };
}
