import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentAdminAction } from "@/actions/auth";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GBP_SCOPE = "https://www.googleapis.com/auth/business.manage";

function redirectTarget(req: NextRequest, query: string): URL {
  const origin = req.nextUrl.origin;
  return new URL(`/admin/listings/api-sync?${query}`, origin);
}

/**
 * Admin Google Business Profile OAuth 2.0 handler:
 * - GET ?action=connect -> redirects signed-in admin to Google OAuth consent screen
 * - GET ?code=...       -> exchanges authorization code for access + refresh tokens and stores in PostgreSQL
 */
export async function GET(req: NextRequest) {
  const admin = await getCurrentAdminAction();
  if (!admin) {
    return NextResponse.json({ error: "Admin session required" }, { status: 401 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const callbackUrl =
    process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() ||
    `${req.nextUrl.origin}/api/admin/google-oauth`;

  const action = req.nextUrl.searchParams.get("action");
  const code = req.nextUrl.searchParams.get("code");
  const oauthError = req.nextUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      redirectTarget(req, `oauth_error=${encodeURIComponent(oauthError)}`)
    );
  }

  if (action === "connect") {
    if (!clientId) {
      return NextResponse.json(
        {
          error:
            "GOOGLE_CLIENT_ID is not configured in environment variables. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.",
        },
        { status: 400 }
      );
    }

    const authUrl = new URL(GOOGLE_AUTH_URL);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", callbackUrl);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", GBP_SCOPE);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("include_granted_scopes", "true");

    return NextResponse.redirect(authUrl.toString());
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing 'action=connect' or OAuth 'code' parameter." },
      { status: 400 }
    );
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      redirectTarget(req, "oauth_error=missing_google_client_credentials")
    );
  }

  try {
    const form = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    });

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      cache: "no-store",
    });

    const tokenJson = (await tokenRes.json().catch(() => ({}))) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokenJson.access_token) {
      const msg = tokenJson.error_description || tokenJson.error || `HTTP_${tokenRes.status}`;
      return NextResponse.redirect(
        redirectTarget(req, `oauth_error=${encodeURIComponent(msg)}`)
      );
    }

    const existing = await prisma.apiConnector
      .findUnique({ where: { id: "google-gbp" } })
      .catch(() => null);

    await prisma.apiConnector.upsert({
      where: { id: "google-gbp" },
      update: {
        connected: true,
        accountLabel: `OAuth connected (${admin.email || "Admin"})`,
        apiKeyEncrypted: tokenJson.access_token,
        ...(tokenJson.refresh_token ? { apiSecretEncrypted: tokenJson.refresh_token } : {}),
        lastPulled: "OAuth Connected",
      },
      create: {
        id: "google-gbp",
        name: "Google Business Profile API",
        provider: "Google",
        connected: true,
        accountLabel: `OAuth connected (${admin.email || "Admin"})`,
        authType: "OAuth 2.0",
        capability: "Two-way sync",
        endpointDoc: "mybusinessbusinessinformation.googleapis.com/v1",
        directoriesCovered: ["google", "google-maps", "apple-maps"],
        locationsMatched: 3,
        lastPulled: "OAuth Connected",
        apiKeyEncrypted: tokenJson.access_token,
        apiSecretEncrypted: tokenJson.refresh_token || existing?.apiSecretEncrypted || null,
      },
    });

    await prisma.apiSyncLog
      .create({
        data: {
          connectorId: "google-gbp",
          action: "OAUTH_CONNECT",
          status: "SUCCESS",
          message: `Google Business Profile OAuth connected by ${admin.email || "admin"}${
            tokenJson.refresh_token ? " (offline refresh token stored)" : ""
          }.`,
          itemsSynced: 3,
        },
      })
      .catch(() => {});

    return NextResponse.redirect(redirectTarget(req, "oauth=connected"));
  } catch (err) {
    console.error("[google-oauth] Callback error:", err);
    return NextResponse.redirect(
      redirectTarget(req, "oauth_error=oauth_callback_exception")
    );
  }
}
