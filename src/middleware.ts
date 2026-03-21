import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  const { pathname } = request.nextUrl;

  const protectedPrefixes = ["/dashboard", "/programs"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (!sessionToken && isProtected) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/programs/:path*"],
};
