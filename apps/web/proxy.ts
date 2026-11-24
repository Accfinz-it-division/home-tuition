import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, validateSession, COOKIE_NAME } from "@/lib/auth";

const roleHome: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  PARENT: "/dashboard/parent",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));

    // Validate session in DB
    if (payload.sessionId) {
      const session = await validateSession(payload.sessionId);
      if (!session) return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role check
    const match = pathname.match(/^\/dashboard\/(\w+)/);
    if (match) {
      const requested = match[1].toUpperCase();
      if (requested !== payload.role) {
        return NextResponse.redirect(new URL(roleHome[payload.role], req.url));
      }
    }
  }

  if (pathname === "/login" || pathname === "/register") {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        if (payload.sessionId) {
          const session = await validateSession(payload.sessionId);
          if (session) {
            return NextResponse.redirect(new URL(roleHome[payload.role], req.url));
          }
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};