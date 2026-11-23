import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// Map each role to its dashboard route
const roleHome: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  PARENT: "/dashboard/parent",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));

    // Check role access (e.g., /dashboard/admin requires ADMIN)
    const match = pathname.match(/^\/dashboard\/(\w+)/);
    if (match) {
      const requested = match[1].toUpperCase();
      if (requested !== payload.role) {
        return NextResponse.redirect(new URL(roleHome[payload.role], req.url));
      }
    }
  }

  // Redirect logged-in users away from login/register
  if (pathname === "/login" || pathname === "/register") {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL(roleHome[payload.role], req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};