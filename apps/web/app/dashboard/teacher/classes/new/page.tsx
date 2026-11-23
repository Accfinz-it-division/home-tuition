import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { ClassForm } from "./class-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export default async function NewClassPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.id },
    include: { courses: true },
  });

  if (!teacher) redirect("/dashboard/teacher");

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/dashboard/teacher/classes"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D9488] mb-2 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Live Classes
        </Link>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white">
          Schedule Live Class
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add a new Zoom meeting for your students.
        </p>
      </div>

      <ClassForm courses={teacher.courses.map((c) => ({ id: c.id, title: c.title }))} />
    </div>
  );
}
