import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { renewals } from "@/lib/db/schema";
import { eq, like, or, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = params.get("category");
  const search = params.get("search");
  const days = params.get("days");

  const conditions = [];

  if (category && (category === "home" || category === "car")) {
    conditions.push(eq(renewals.category, category));
  }

  if (search) {
    conditions.push(
      or(
        like(renewals.provider, `%${search}%`),
        like(renewals.policyNumber, `%${search}%`)
      )!
    );
  }

  if (days) {
    const daysNum = parseInt(days);
    if (!isNaN(daysNum)) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysNum);
      conditions.push(
        sql`${renewals.renewalDate} <= ${futureDate.toISOString().split("T")[0]}`
      );
    }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const results = db
    .select()
    .from(renewals)
    .where(where)
    .orderBy(sql`${renewals.renewalDate} ASC`)
    .all();

  return NextResponse.json(results);
}
