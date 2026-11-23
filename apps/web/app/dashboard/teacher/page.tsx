import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Video,
  CreditCard,
  ArrowRight,
  CalendarCheck,
} from "lucide-react";




export default async function TeacherOverview() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.id },
    include: {
      courses: {
        include: {
          enrollments: { include: { student: { include: { user: true } } } },
          zoomMeetings: { orderBy: { startTime: "desc" }, take: 5 },
        },
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

  // Get all student IDs from all courses
  const studentIds = new Set<string>();
  teacher.courses.forEach((c) =>
    c.enrollments.forEach((e) => studentIds.add(e.studentId))
  );

  // Payments for teacher's courses
  const payments = await prisma.payment.findMany({
    where: {
      courseId: { in: teacher.courses.map((c) => c.id) },
      status: "PAID",
    },
  });

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Upcoming classes
  const now = new Date();
  const allMeetings = teacher.courses.flatMap((c) => c.zoomMeetings);
  const upcomingClasses = allMeetings
    .filter((m) => new Date(m.startTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Welcome, {payload.email.split("@")[0]}.
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Here's your teaching overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">My Courses</p>
            <BookOpen size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            {teacher.courses.length}
          </p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">My Students</p>
            <Users size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            {studentIds.size}
          </p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
            <CreditCard size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            Rs. {totalRevenue}
          </p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Upcoming Classes</p>
            <Video size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            {upcomingClasses.length}
          </p>
        </div>
      </div>

      {/* Courses + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#0A1F37] dark:text-white">My Courses</h2>
            <Link
              href="/dashboard/teacher/courses"
              className="text-xs font-semibold text-[#0D9488] hover:underline"
            >
              View All →
            </Link>
          </div>

          {teacher.courses.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No courses yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {teacher.courses.slice(0, 4).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700 hover:border-teal transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#E4B85B] to-[#C99B3D] rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                        {course.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {course.enrollments.length} student
                        {course.enrollments.length !== 1 ? "s" : ""} • {course.category}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal flex-shrink-0">
                    Rs. {course.regularFee.toString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-base font-bold text-[#0A1F37] dark:text-white mb-3">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/teacher/classes"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Video size={16} /> Schedule Class
              </span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/dashboard/teacher/attendance"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors"
            >
              <span className="flex items-center gap-2">
                <CalendarCheck size={16} /> Mark Attendance
              </span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/dashboard/teacher/resources"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileText size={16} /> Upload Resource
              </span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0A1F37] dark:text-white flex items-center gap-2">
            <Video size={16} className="text-[#0D9488]" />
            Upcoming Classes
          </h2>
          <Link
            href="/dashboard/teacher/classes"
            className="text-xs font-semibold text-[#0D9488] hover:underline"
          >
            View All
          </Link>
        </div>

        {upcomingClasses.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No upcoming classes scheduled.
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingClasses.map((m) => {
              const course = teacher.courses.find((c) =>
                c.zoomMeetings.some((z) => z.id === m.id)
              );
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video size={16} className="text-teal" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                        {m.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {course?.title} •{" "}
                        {new Date(m.startTime).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <a
                    href={m.link}
                    target="_blank"
                    className="text-xs font-semibold text-teal hover:underline px-2 whitespace-nowrap"
                  >
                    Join →
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}