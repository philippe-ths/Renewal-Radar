import pdf from "pdf-parse";
import fs from "fs";
import path from "path";

export async function extractPdfText(messageId: string, filename: string): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "data",
    "attachments",
    `${messageId}_${filename}`
  );

  if (!fs.existsSync(filePath)) {
    return "";
  }

  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  return data.text;
}

export async function extractPdfFromBuffer(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}
