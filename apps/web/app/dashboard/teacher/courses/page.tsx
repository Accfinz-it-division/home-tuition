import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, Users, ArrowRight, Plus } from "lucide-react";



export default async function TeacherCoursesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.id },
    include: {
      courses: {
        include: {
          enrollments: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!teacher) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Teacher profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
            My Courses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your courses and view student enrollments.
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      {teacher.courses.length === 0 ? (
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-12 text-center">
          <BookOpen size={56} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-[#0A1F37] dark:text-white mb-2">
            No courses yet
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Contact admin to create a new course for you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacher.courses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/teacher/courses/${course.id}`}
              className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 overflow-hidden hover:border-teal hover:shadow-lg transition-all group"
            >
              {/* Header */}
              <div className="h-24 bg-gradient-to-br from-[#E4B85B] to-[#C99B3D] relative">
                <div className="absolute bottom-2 left-3 flex gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur text-white px-2 py-0.5 rounded">
                    {course.category}
                  </span>
                  {course.grade && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0A1F37] text-white px-2 py-0.5 rounded">
                      Grade {course.grade}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <h3 className="font-bold text-[#0A1F37] dark:text-white mb-2 line-clamp-2 group-hover:text-teal transition-colors">
                  {course.title}
                </h3>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-navy-700 text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users size={12} />
                    <span>{course.enrollments.length} students</span>
                  </div>
                  <span className="font-bold text-teal">
                    Rs. {course.regularFee.toString()}
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