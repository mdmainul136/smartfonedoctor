import { NextResponse } from "next/server";
import { logoutAdminAction } from "@/actions/auth";

function getRedirectUrl(request: Request): URL {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost && !forwardedHost.includes("localhost") && !forwardedHost.includes("127.0.0.1")) {
    return new URL("/sign-in", `${forwardedProto}://${forwardedHost}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && !siteUrl.includes("localhost")) {
    return new URL("/sign-in", siteUrl);
  }

  if (process.env.NODE_ENV === "production") {
    return new URL("/sign-in", "https://smartfonedoctor.com");
  }

  return new URL("/sign-in", request.url);
}

export async function GET(request: Request) {
  await logoutAdminAction();
  return NextResponse.redirect(getRedirectUrl(request));
}

export async function POST(request: Request) {
  await logoutAdminAction();
  return NextResponse.redirect(getRedirectUrl(request));
}
