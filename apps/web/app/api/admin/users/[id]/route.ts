import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

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
  const { isActive } = await req.json();

  if (typeof isActive !== "boolean")
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
    });
    return NextResponse.json({ success: true, isActive: updated.isActive });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}