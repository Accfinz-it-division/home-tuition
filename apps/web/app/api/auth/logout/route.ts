import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken, deleteSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (token) {
    const payload = await verifyToken(token);
    if (payload?.sessionId) {
      await deleteSession(payload.sessionId);
    }
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}