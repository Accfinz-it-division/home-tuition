import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "STUDENT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { courseId } = body;
  if (!courseId)
    return NextResponse.json({ error: "Course ID required" }, { status: 400 });

  const student = await prisma.student.findUnique({
    where: { userId: payload.id },
  });
  if (!student)
    return NextResponse.json({ error: "Student not found" }, { status: 404 });

  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: { studentId: student.id, courseId },
    },
  });

  if (existing) {
    if (existing.status === "APPROVED")
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
    if (existing.status === "PENDING")
      return NextResponse.json({ error: "Enrollment pending" }, { status: 400 });
    if (existing.status === "REJECTED")
      return NextResponse.json({ error: "Enrollment rejected" }, { status: 400 });
  }

  // Create enrollment with PENDING status
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId,
      status: "PENDING",
    },
  });

  return NextResponse.json({ success: true, enrollment }, { status: 201 });
}