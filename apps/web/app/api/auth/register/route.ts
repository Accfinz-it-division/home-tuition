import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { name, email, phone, nic, dob, password, role, parentNic, grade } =
      parsed.data;

    let isMinor = false;
    if (role === "STUDENT" && dob) {
      const age = new Date().getFullYear() - new Date(dob).getFullYear();
      isMinor = age < 18;
      if (isMinor && !parentNic) {
        return NextResponse.json(
          { error: "Parent NIC required for students under 18" },
          { status: 400 }
        );
      }
    }

    const hash = await bcrypt.hash(password, 10);

    let parentRecord = null;
    if (isMinor && parentNic) {
      const parentUser = await prisma.user.findFirst({
        where: { nic: parentNic, role: "PARENT" },
        include: { parent: true },
      });
      if (parentUser?.parent) parentRecord = parentUser.parent;
    }

    const user = await prisma.user.create({
      data: {
        name, email,
        phone: phone || null,
        nic: nic || null,
        dob: dob ? new Date(dob) : null,
        password: hash,
        role,
        ...(role === "TEACHER" && {
          teacher: { create: { status: "PENDING" } },
        }),
        ...(role === "PARENT" && {
          parent: { create: { nic: nic || "" } },
        }),
        ...(role === "STUDENT" && {
          student: {
            create: {
              grade: grade ? parseInt(grade) : null,
              parentId: parentRecord?.id || null,
            },
          },
        }),
      },
    });

    // ✅ Safe email (won't crash register)
    try {
      await sendWelcomeEmail(user.email, user.name, role);
    } catch (err) {
      console.error("Welcome email failed (non-critical):", err);
    }

    return NextResponse.json(
      { id: user.id, message: "Registered successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Register error:", err);
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Email or NIC already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}