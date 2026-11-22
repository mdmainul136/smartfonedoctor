import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "sfd_admin_session";

function getCanonicalOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost && !forwardedHost.includes("localhost") && !forwardedHost.includes("127.0.0.1")) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  if (process.env.NODE_ENV === "production") {
    return "https://smartfonedoctor.com";
  }
  return new URL(request.url).origin;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const rawPath = new URL(request.url).pathname;

  // Normalize accidental double/multiple slashes (e.g. //locations/... -> /locations/...)
  // Prevents browser History.replaceState SecurityError on protocol-relative "//" paths.
  if (rawPath.includes("//") || pathname.includes("//")) {
    const cleanPath = (rawPath.includes("//") ? rawPath : pathname).replace(/\/{2,}/g, "/");
    const targetPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    return NextResponse.redirect(new URL(`${targetPath}${search}`, getCanonicalOrigin(request)), 308);
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isProtectedRoute =
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/list/");

  // 1. Unauthenticated users trying to access protected admin pages
  if (isProtectedRoute && !sessionToken) {
    const from = encodeURIComponent(`${pathname}${search}`);
    const redirectUrl = new URL(`/sign-in?from=${from}`, getCanonicalOrigin(request));
    return NextResponse.redirect(redirectUrl);
  }

  // Auto-login redirect disabled: Users visiting /sign-in or /login always see the sign-in page
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)$).*)",
  ],
};
