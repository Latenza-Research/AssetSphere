import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PROTECTED     = ["/dashboard", "/assets", "/bookings", "/admin", "/notifications"];
const SUPERADMIN_PATHS = ["/superadmin"];
const ORG_ADMIN_PATHS  = ["/admin"];
const AUTH_PAGES    = ["/login", "/register", "/onboard"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const user    = session?.user;

  // Redirect authenticated users away from auth/onboard pages
  if (user && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Invite accept page is always public — skip all guards
  if (pathname.startsWith("/invite/")) {
    return NextResponse.next();
  }

  // Superadmin-only paths
  if (SUPERADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!user.isSuperAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Org-admin-only paths
  if (ORG_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!user) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (user.orgRole !== "ORG_ADMIN" && !user.isSuperAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // General protected paths
  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!user) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

// export config matching regrex
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
