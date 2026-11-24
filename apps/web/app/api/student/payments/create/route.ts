import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { generatePaymentHash, PAYHERE_CONFIG } from "@/lib/payhere";

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

  // Get student
  const student = await prisma.student.findUnique({
    where: { userId: payload.id },
    include: { user: true },
  });
  if (!student)
    return NextResponse.json({ error: "Student not found" }, { status: 404 });

  // Check if already paid
  const existing = await prisma.payment.findFirst({
    where: { studentId: student.id, courseId, month, status: "PAID" },
  });
  if (existing)
    return NextResponse.json({ error: "Already paid" }, { status: 400 });

  // Get course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course)
    return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // Create payment record (PENDING)
  const orderId = `ORDER-${Date.now()}-${student.id.slice(0, 6)}`;
  const payment = await prisma.payment.create({
    data: {
      studentId: student.id,
      courseId,
      amount,
      month,
      status: "PENDING",
      gatewayRef: orderId,
    },
  });

  // Generate hash for PayHere
  const hash = generatePaymentHash(orderId, Number(amount));

  // Return payment config for frontend
  return NextResponse.json({
    success: true,
    payment,
    payhereConfig: {
      sandbox: PAYHERE_CONFIG.sandbox,
      merchant_id: PAYHERE_CONFIG.merchantId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/payments?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/payments?cancelled=true`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payhere/notify`,
      order_id: orderId,
      items: course.title,
      amount: Number(amount).toFixed(2),
      currency: "LKR",
      hash,
      first_name: student.user.name.split(" ")[0] || "Student",
      last_name: student.user.name.split(" ")[1] || "User",
      email: student.user.email,
      phone: student.user.phone || "0771234567",
      address: "Colombo",
      city: "Colombo",
      country: "Sri Lanka",
    },
  });
}