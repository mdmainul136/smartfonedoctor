import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "sfd_admin_session";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isProtectedRoute =
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/list/");

  const isAuthRoute =
    pathname === "/sign-in" ||
    pathname === "/login";

  // 1. Unauthenticated users trying to access protected admin pages
  if (isProtectedRoute && !sessionToken) {
    const from = encodeURIComponent(`${pathname}${search}`);
    const redirectUrl = new URL(`/sign-in?from=${from}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Authenticated users visiting sign-in page should be redirected to admin
  if (isAuthRoute && sessionToken) {
    const fromParam = request.nextUrl.searchParams.get("from");
    const targetUrl = fromParam ? decodeURIComponent(fromParam) : "/admin";
    const redirectUrl = new URL(targetUrl.startsWith("/") ? targetUrl : "/admin", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile",
    "/profile/:path*",
    "/list/:path*",
    "/sign-in",
    "/login",
  ],
};
