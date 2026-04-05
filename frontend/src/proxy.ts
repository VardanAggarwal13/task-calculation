import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth pages - if user has token, redirect to dashboard
  if (pathname === "/login" || pathname === "/register") {
    // We can't read localStorage in middleware, but we can check for a cookie
    // For this app, auth check happens client-side via AuthProvider
    return NextResponse.next();
  }

  // Protected routes - client-side auth check handles redirection
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
