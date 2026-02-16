import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/gmail/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  try {
    await exchangeCode(code);
    return NextResponse.redirect(new URL("/?connected=true", request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
  }
}
