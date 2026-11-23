import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { sendAbsenceEmail } from "@/lib/email";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "TEACHER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { courseId, date, records } = body;

  if (!courseId || !date || !Array.isArray(records))
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const dateObj = new Date(date + "T00:00:00");

  try {
    for (const { studentId, status } of records) {
      if (!["PRESENT", "ABSENT", "LATE"].includes(status)) continue;

      const existing = await prisma.attendance.findFirst({
        where: { studentId, courseId, date: dateObj },
      });

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: { status },
        });
      } else {
        await prisma.attendance.create({
          data: { studentId, courseId, date: dateObj, status },
        });
      }

      // ✅ Send absence alert to parent
      if (status === "ABSENT") {
        const student = await prisma.student.findUnique({
          where: { id: studentId },
          include: {
            user: true,
            parent: { include: { user: true } },
          },
        });
        const course = await prisma.course.findUnique({
          where: { id: courseId },
        });

        if (student?.parent?.user && course) {
          sendAbsenceEmail(
            student.parent.user.email,
            student.parent.user.name,
            student.user.name,
            course.title,
            new Date(date).toLocaleDateString()
          ).catch((err) => console.error("Absence email failed:", err));
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}