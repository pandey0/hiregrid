import { NextRequest, NextResponse } from "next/server";
import { publicLinkRatelimit } from "@/lib/ratelimit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rate Limiting for Public Magic Links (Story 7.1 / HG-006)
  const isPublicMagicLink = ["/book", "/availability", "/agency"].some(p => pathname.startsWith(p));
  
  if (isPublicMagicLink && publicLinkRatelimit) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await publicLinkRatelimit.limit(ip);
    
    if (!success) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // 2. Authentication Protection
  const sessionToken =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  const protectedPrefixes = ["/dashboard", "/programs", "/settings"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (!sessionToken && isProtected) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/programs/:path*", 
    "/settings/:path*",
    "/book/:path*",
    "/availability/:path*",
    "/agency/:path*"
  ],
};
