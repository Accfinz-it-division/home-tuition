import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CourseActions } from "./course-actions";
import { Plus, BookOpen } from "lucide-react";

// ✅ Force dynamic rendering
export const dynamic = "force-dynamic";

// Helper: Category label mapping
const categoryLabels: Record<string, string> = {
  PRIMARY: "Primary",
  SECONDARY: "Secondary",
  OL: "O/L",
  AL: "A/L",
  LANGUAGE: "Language",
  GOV_EXAM: "Gov Exam",
  SKILL: "Skill",
};

export default async function AdminCoursesPage() {
  // ✅ Fetch all courses + dynamic counts
  const [courses, totalCourses, categoryCounts] = await Promise.all([
    prisma.course.findMany({
      include: { teacher: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.count(),
    prisma.course.groupBy({
      by: ["category"],
      _count: true,
    }),
  ]);

  // Convert category counts to a map for easy lookup
  const counts: Record<string, number> = {};
  categoryCounts.forEach((c) => {
    counts[c.category] = c._count;
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
            Manage Courses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, edit, and manage all courses on the platform.
          </p>
        </div>
        <Link
          href="/dashboard/admin/courses/new"
          className="flex items-center gap-2 bg-[#0D9488] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0F766E] transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Course
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Courses</p>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{totalCourses}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">A/L Courses</p>
          <p className="text-2xl font-bold text-teal">{counts["AL"] || 0}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">O/L Courses</p>
          <p className="text-2xl font-bold text-[#E4B85B]">{counts["OL"] || 0}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Primary Courses</p>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{counts["PRIMARY"] || 0}</p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC] dark:bg-[#0A1F37] border-b border-gray-200 dark:border-navy-700">
            <tr>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Course
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Teacher
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fee
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <BookOpen size={40} className="mb-3 opacity-20" />
                    <p className="text-sm font-medium">No courses found.</p>
                    <p className="text-xs mt-1">Click "Add Course" to create the first one.</p>
                  </div>
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#12345B] to-[#0A1F37] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <BookOpen size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                          {course.title}
                        </p>
                        {/* ✅ Subject, Category, Medium badges */}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-teal/10 text-teal px-1.5 py-0.5 rounded">
                            {categoryLabels[course.category] || course.category}
                          </span>
                          {course.subject && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                              {course.subject}
                            </span>
                          )}
                          {course.medium && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                              {course.medium}
                            </span>
                          )}
                          {course.grade && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                              Grade {course.grade}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {course.teacher.user.name}
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-[#0A1F37] dark:text-white">
                    Rs. {course.regularFee.toString()}
                  </td>
                  <td className="px-5 py-3">
                    <CourseActions courseId={course.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}