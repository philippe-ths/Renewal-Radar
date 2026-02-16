export function buildExtractionPrompt(
  emailSubject: string,
  emailBody: string,
  pdfText?: string
): string {
  const pdfSection = pdfText
    ? `\n\n--- PDF ATTACHMENT TEXT ---\n${pdfText.slice(0, 8000)}`
    : "";

  return `You are analysing an email (and optionally an attached PDF) to determine if it relates to a UK home or car insurance renewal. Extract structured data with evidence snippets.

--- EMAIL SUBJECT ---
${emailSubject}

--- EMAIL BODY ---
${emailBody.slice(0, 8000)}${pdfSection}

--- INSTRUCTIONS ---
1. Determine if this email is about a home or car insurance renewal (is_renewal: true/false).
2. If it IS a renewal, extract:
   - category: "home" or "car"
   - provider: the insurance company name
   - policy_number: if visible
   - renewal_date: the renewal/expiry date in ISO format (YYYY-MM-DD)
   - premium_annual: annual premium in GBP (number only, no currency symbol)
   - premium_monthly: monthly premium if shown (number only)
   - currency: always "GBP" for UK insurance
3. For EACH extracted field, provide an "evidence" snippet — the exact quote from the source text that supports the extraction. Keep snippets short (1-2 sentences max).
4. If a field cannot be determined, set it to null with null evidence.

Respond with ONLY valid JSON matching this schema:
{
  "is_renewal": boolean,
  "category": "home" | "car" | null,
  "provider": string | null,
  "policy_number": string | null,
  "renewal_date": "YYYY-MM-DD" | null,
  "premium_annual": number | null,
  "premium_monthly": number | null,
  "currency": "GBP",
  "evidence": {
    "category": string | null,
    "provider": string | null,
    "policy_number": string | null,
    "renewal_date": string | null,
    "premium": string | null
  }
}`;
}
