import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, category, grade, description, firstFee, regularFee, teacherId } = body;

  if (!title || !category || !teacherId || firstFee == null || regularFee == null)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const course = await prisma.course.create({
      data: {
        title, category,
        grade: grade || null,
        description: description || null,
        firstFee, regularFee, teacherId,
      },
    });
    return NextResponse.json(course, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}