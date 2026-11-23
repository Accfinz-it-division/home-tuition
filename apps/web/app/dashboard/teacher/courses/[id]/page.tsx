import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Video,
  CalendarCheck,
  FileText,
  BookOpen,
  User,
} from "lucide-react";




export default async function TeacherCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.id },
  });
  if (!teacher) redirect("/dashboard/teacher");

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: { student: { include: { user: true } } },
      },
      zoomMeetings: { orderBy: { startTime: "desc" }, take: 5 },
      resources: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!course || course.teacherId !== teacher.id) notFound();

  return (
    <div className="space-y-4">
      {/* Back + Header */}
      <div>
        <Link
          href="/dashboard/teacher/courses"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D9488] mb-2 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Courses
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-1">
              {course.title}
            </h1>
            <div className="flex gap-2 mt-1">
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
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Enrolled Students</p>
            <Users size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{course.enrollments.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Upcoming Classes</p>
            <Video size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            {course.zoomMeetings.filter((z) => new Date(z.startTime) >= new Date()).length}
          </p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Resources</p>
            <FileText size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{course.resources.length}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Description + Students */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              About this Course
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {course.description || "No description provided."}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users size={14} /> Enrolled Students ({course.enrollments.length})
            </h2>
            {course.enrollments.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No students enrolled yet.</p>
            ) : (
              <div className="space-y-2">
                {course.enrollments.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 dark:border-navy-700"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-[#0A1F37] to-[#12345B] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {e.student.user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                        {e.student.user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{e.student.user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/teacher/attendance"
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors"
              >
                <CalendarCheck size={16} /> Mark Attendance
              </Link>
              <Link
                href="/dashboard/teacher/classes"
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors"
              >
                <Video size={16} /> Schedule Class
              </Link>
              <Link
                href="/dashboard/teacher/resources"
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors"
              >
                <FileText size={16} /> Upload Resource
              </Link>
            </div>
          </div>

          {/* Fee */}
          <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Course Fee
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">First Class</span>
                <span className="font-bold text-teal">Rs. {course.firstFee.toString()}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-navy-700">
                <span className="text-gray-600 dark:text-gray-400">Regular Fee</span>
                <span className="font-bold text-[#0A1F37] dark:text-white">Rs. {course.regularFee.toString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}