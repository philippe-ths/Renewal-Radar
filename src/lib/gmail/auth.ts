import { google } from "googleapis";
import { db } from "@/lib/db";
import { gmailTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export async function exchangeCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  // Get user email
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const profile = await gmail.users.getProfile({ userId: "me" });
  const email = profile.data.emailAddress || "";

  // Upsert token (single row)
  const existing = db.select().from(gmailTokens).where(eq(gmailTokens.id, 1)).get();

  if (existing) {
    db.update(gmailTokens)
      .set({
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || existing.refreshToken,
        expiryDate: tokens.expiry_date!,
        email,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(gmailTokens.id, 1))
      .run();
  } else {
    db.insert(gmailTokens)
      .values({
        id: 1,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiryDate: tokens.expiry_date!,
        email,
      })
      .run();
  }

  return { email, tokens };
}

export async function getAuthenticatedClient() {
  const stored = db.select().from(gmailTokens).where(eq(gmailTokens.id, 1)).get();

  if (!stored) return null;

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: stored.accessToken,
    refresh_token: stored.refreshToken,
    expiry_date: stored.expiryDate,
  });

  // Auto-refresh if expired
  const now = Date.now();
  if (stored.expiryDate < now) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    db.update(gmailTokens)
      .set({
        accessToken: credentials.access_token!,
        expiryDate: credentials.expiry_date!,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(gmailTokens.id, 1))
      .run();
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}

export function getStoredToken() {
  return db.select().from(gmailTokens).where(eq(gmailTokens.id, 1)).get() || null;
}
