import { prisma } from "@/lib/prisma";
import { CourseForm } from "../course-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export const instant = false;

export default async function NewCoursePage() {
  const teachers = await prisma.teacher.findMany({
    where: { status: "VERIFIED" },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/dashboard/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D9488] mb-2 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Courses
        </Link>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white">
          Add New Course
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create a new course on the platform.
        </p>
      </div>

      <CourseForm
        mode="create"
        teachers={teachers.map((t) => ({ id: t.id, name: t.user.name }))}
      />
    </div>
  );
}