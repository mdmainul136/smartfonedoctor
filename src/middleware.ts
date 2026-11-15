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

  // Auto-login redirect disabled: Users visiting /sign-in or /login always see the sign-in page
  return NextResponse.next();

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
