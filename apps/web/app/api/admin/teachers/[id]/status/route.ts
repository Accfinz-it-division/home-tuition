import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { sendTeacherVerifiedEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  if (!["PENDING", "VERIFIED", "REJECTED"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const updated = await prisma.teacher.update({
    where: { id },
    data: { status },
  });

  // ✅ Send verification email
  if (status === "VERIFIED") {
    const user = await prisma.user.findUnique({
      where: { id: updated.userId },
    });
    if (user) {
      sendTeacherVerifiedEmail(user.email, user.name).catch((err) =>
        console.error("Verify email failed:", err)
      );
    }
  }

  return NextResponse.json(updated);
}