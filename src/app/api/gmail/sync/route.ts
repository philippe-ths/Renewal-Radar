import { NextResponse } from "next/server";
import { getStoredToken } from "@/lib/gmail/auth";
import { syncEmails } from "@/lib/gmail/client";
import { processUnextractedEmails } from "@/lib/extraction/extractor";

export async function POST() {
  try {
    const token = getStoredToken();
    if (!token) {
      return NextResponse.json(
        { error: "Gmail not connected" },
        { status: 401 }
      );
    }

    // Step 1: Sync emails from Gmail
    const syncResult = await syncEmails();

    // Step 2: Process unextracted emails through LLM
    const extractionResult = await processUnextractedEmails();

    return NextResponse.json({
      emails: syncResult,
      extractions: extractionResult,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}
