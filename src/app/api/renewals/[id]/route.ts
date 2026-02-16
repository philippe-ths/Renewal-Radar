import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { renewals, emails } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const renewal = db
    .select()
    .from(renewals)
    .where(eq(renewals.id, params.id))
    .get();

  if (!renewal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get associated email
  let email = null;
  if (renewal.emailId) {
    email = db
      .select()
      .from(emails)
      .where(eq(emails.id, renewal.emailId))
      .get();
  }

  return NextResponse.json({ renewal, email });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const allowedFields = [
    "category",
    "provider",
    "policyNumber",
    "renewalDate",
    "premiumAnnual",
    "premiumMonthly",
    "status",
  ] as const;

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  db.update(renewals).set(updates).where(eq(renewals.id, params.id)).run();

  const updated = db
    .select()
    .from(renewals)
    .where(eq(renewals.id, params.id))
    .get();

  return NextResponse.json(updated);
}
