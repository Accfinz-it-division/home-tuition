import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";


export default async function StudentAttendancePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: payload.id },
    include: {
      enrollments: { include: { course: true } },
      attendances: { orderBy: { date: "desc" } },
    },
  });

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Student profile not found.</p>
      </div>
    );
  }

  const totalClasses = student.attendances.length;
  const presentCount = student.attendances.filter((a) => a.status === "PRESENT").length;
  const absentCount = student.attendances.filter((a) => a.status === "ABSENT").length;
  const lateCount = student.attendances.filter((a) => a.status === "LATE").length;
  const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  // Course-wise attendance
  const courseStats = student.enrollments.map((enrollment) => {
    const courseAttendances = student.attendances.filter(
      (a) => a.courseId === enrollment.courseId
    );
    const coursePresent = courseAttendances.filter((a) => a.status === "PRESENT").length;
    const total = courseAttendances.length;
    const percent = total > 0 ? Math.round((coursePresent / total) * 100) : 0;
    return {
      course: enrollment.course,
      total,
      present: coursePresent,
      percent,
    };
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Attendance
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track your class attendance and monthly performance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Overall %</p>
            <TrendingUp size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{percentage}%</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Present</p>
            <CheckCircle size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-teal">{presentCount}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Absent</p>
            <XCircle size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500">{absentCount}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Late</p>
            <Clock size={16} className="text-[#D97706]" />
          </div>
          <p className="text-2xl font-bold text-[#D97706]">{lateCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Course-wise Attendance */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarCheck size={16} className="text-teal" /> Course-wise Attendance
          </h2>

          {courseStats.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No courses enrolled yet.
            </p>
          ) : (
            <div className="space-y-4">
              {courseStats.map((stat) => (
                <div key={stat.course.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                      {stat.course.title}
                    </p>
                    <p className="text-xs font-semibold text-gray-500">
                      {stat.present}/{stat.total} ({stat.percent}%)
                    </p>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        stat.percent >= 75
                          ? "bg-teal"
                          : stat.percent >= 50
                          ? "bg-[#F59E0B]"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${stat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Legend
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">75%+ (Excellent)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#F59E0B] rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">50–74% (Average)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Below 50% (Low)</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-navy-700 text-xs text-gray-500">
            Aim for 75%+ attendance to keep your parents informed and stay on track.
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Recent Attendance History
        </h2>

        {student.attendances.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No attendance records yet.
          </p>
        ) : (
          <div className="space-y-2">
            {student.attendances.slice(0, 20).map((a) => {
              const course = student.enrollments.find(
                (e) => e.courseId === a.courseId
              )?.course;
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalendarCheck size={16} className="text-teal" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                        {course?.title || "Course"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(a.date).toLocaleDateString("en-US", {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                      a.status === "PRESENT"
                        ? "bg-teal/10 text-teal"
                        : a.status === "LATE"
                        ? "bg-[#F59E0B]/10 text-[#D97706]"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
