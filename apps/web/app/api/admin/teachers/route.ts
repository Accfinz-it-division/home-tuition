import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, phone, nic, password, qualifications, bio, status } = body;

  if (!name || !email || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name, email, phone: phone || null, nic: nic || null,
        password: hash, role: "TEACHER",
        teacher: {
          create: {
            qualifications: qualifications || null,
            bio: bio || null,
            status: status || "PENDING",
          },
        },
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002")
      return NextResponse.json({ error: "Email or NIC exists" }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}