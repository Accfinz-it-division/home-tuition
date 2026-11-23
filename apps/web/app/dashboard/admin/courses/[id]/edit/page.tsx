import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CourseForm } from "../../course-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, teachers] = await Promise.all([
    prisma.course.findUnique({ where: { id } }),
    prisma.teacher.findMany({
      where: { status: "VERIFIED" },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
  ]);
  if (!course) notFound();

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
          Edit Course
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update course details.
        </p>
      </div>

      <CourseForm
        mode="edit"
        courseId={course.id}
        teachers={teachers.map((t) => ({ id: t.id, name: t.user.name }))}
        defaultValues={{
          title: course.title,
          category: course.category,
          grade: course.grade,
          description: course.description || "",
          firstFee: Number(course.firstFee),
          regularFee: Number(course.regularFee),
          teacherId: course.teacherId,
        }}
      />
    </div>
  );
}