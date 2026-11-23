import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "TEACHER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { records } = await req.json();

  if (!Array.isArray(records))
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  try {
    for (const { studentId, score } of records) {
      if (typeof score !== "number" || score < 0) continue;

      await prisma.mark.upsert({
        where: {
          examId_studentId: { examId: id, studentId },
        },
        create: { examId: id, studentId, score },
        update: { score },
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}