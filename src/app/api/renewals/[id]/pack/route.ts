import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { renewalPacks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateRenewalPack } from "@/lib/pack/generator";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await generateRenewalPack(params.id);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to generate pack" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Pack generation error:", error);
    return NextResponse.json(
      { error: "Pack generation failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const packs = db
    .select()
    .from(renewalPacks)
    .where(eq(renewalPacks.renewalId, params.id))
    .all();

  return NextResponse.json(packs);
}
