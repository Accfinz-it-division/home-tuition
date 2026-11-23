import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, BookOpen, User, Award } from "lucide-react";



export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: { teacher: { include: { user: true } }, resources: true },
  });
  if (!course) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/admin/courses"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D9488] mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Courses
          </Link>
          <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            {course.title}
          </h1>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal/10 text-teal px-2 py-1 rounded">
              {course.category}
            </span>
            {course.grade && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-gold-600 px-2 py-1 rounded">
                Grade {course.grade}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/dashboard/admin/courses/${course.id}/edit`}
          className="flex items-center gap-2 bg-[#0D9488] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0F766E] transition-colors shadow-sm"
        >
          <Pencil size={16} /> Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Description */}
        <div className="md:col-span-2 bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Description
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {course.description || "No description provided."}
          </p>
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Pricing
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">First Class</p>
              <p className="text-xl font-bold text-teal">Rs. {course.firstFee.toString()}</p>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-navy-700">
              <p className="text-xs text-gray-500 mb-1">Regular Fee</p>
              <p className="text-xl font-bold text-[#0A1F37] dark:text-white">
                Rs. {course.regularFee.toString()}
              </p>
            </div>
          </div>
        </div>

        {/* Teacher */}
        <div className="md:col-span-3 bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <User size={14} /> Teacher
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
              {course.teacher.user.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-[#0A1F37] dark:text-white">
                {course.teacher.user.name}
              </p>
              <p className="text-sm text-gray-500">
                {course.teacher.qualifications || "—"}
              </p>
            </div>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-teal/10 text-teal px-2 py-1 rounded flex items-center gap-1">
              <Award size={12} /> {course.teacher.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}