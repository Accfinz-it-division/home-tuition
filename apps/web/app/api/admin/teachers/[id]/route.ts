import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  return payload?.role === "ADMIN";
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, email, phone, nic, qualifications, bio, status } = body;

  try {
    await prisma.teacher.update({
      where: { id },
      data: {
        qualifications: qualifications ?? undefined,
        bio: bio ?? undefined,
        status: status ?? undefined,
        user: {
          update: {
            name: name ?? undefined,
            email: email ?? undefined,
            phone: phone ?? undefined,
            nic: nic ?? undefined,
          },
        },
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.teacher.delete({ where: { id } });
    await prisma.user.delete({ where: { id: teacher.userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}