import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, User, ArrowRight } from "lucide-react";


export default async function StudentCoursesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: payload.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              teacher: { include: { user: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Student profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          My Courses
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          All courses you are currently enrolled in.
        </p>
      </div>

      {/* Courses Grid */}
      {student.enrollments.length === 0 ? (
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-12 text-center">
          <BookOpen size={56} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-[#0A1F37] dark:text-white mb-2">
            No courses yet
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            You haven't enrolled in any courses yet.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-[#0D9488] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0F766E] transition-colors"
          >
            Browse Courses <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {student.enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/dashboard/student/courses/${enrollment.course.id}`}
              className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 overflow-hidden hover:border-teal hover:shadow-lg transition-all group"
            >
              {/* Header */}
              <div className="h-24 bg-gradient-to-br from-[#12345B] to-[#14B8A6] relative">
                <div className="absolute bottom-2 left-3 flex gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur text-white px-2 py-0.5 rounded">
                    {enrollment.course.category}
                  </span>
                  {enrollment.course.grade && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E4B85B] text-[#0A1F37] px-2 py-0.5 rounded">
                      Grade {enrollment.course.grade}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <h3 className="font-bold text-[#0A1F37] dark:text-white mb-2 line-clamp-2 group-hover:text-teal transition-colors">
                  {enrollment.course.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <User size={12} />
                  <span className="truncate">{enrollment.course.teacher.user.name}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-navy-700">
                  <span className="text-xs text-gray-400">Monthly Fee</span>
                  <span className="text-sm font-bold text-[#0A1F37] dark:text-white">
                    Rs. {enrollment.course.regularFee.toString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
