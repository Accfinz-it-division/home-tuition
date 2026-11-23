import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { sendPaymentEmail } from "@/lib/email";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "STUDENT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { courseId, amount, month } = body;

  if (!courseId || !amount || !month)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const student = await prisma.student.findUnique({
    where: { userId: payload.id },
  });
  if (!student)
    return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const existing = await prisma.payment.findFirst({
    where: { studentId: student.id, courseId, month, status: "PAID" },
  });
  if (existing)
    return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const payment = await prisma.payment.create({
    data: {
      studentId: student.id, courseId, amount, month,
      status: "PAID",
      gatewayRef: `DEMO-${Date.now()}`,
    },
  });

  // ✅ Send email
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (user && course) {
    sendPaymentEmail(user.email, user.name, Number(amount), month, course.title)
      .catch((err) => console.error("Payment email failed:", err));
  }

  return NextResponse.json({ success: true, payment });
}