import { NextResponse } from "next/server";
import { logoutAdminAction } from "@/actions/auth";

export async function GET(request: Request) {
  await logoutAdminAction();
  const url = new URL("/sign-in", request.url);
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  await logoutAdminAction();
  const url = new URL("/sign-in", request.url);
  return NextResponse.redirect(url);
}
