import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "TEACHER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { courseId, title, type, fileUrl } = body;

  if (!courseId || !title || !type || !fileUrl)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const resource = await prisma.resource.create({
      data: { courseId, title, type, fileUrl },
    });
    return NextResponse.json(resource, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}