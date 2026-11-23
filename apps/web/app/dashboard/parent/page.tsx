import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  CreditCard,
  BookOpen,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";



export default async function ParentOverview() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const parent = await prisma.parent.findUnique({
    where: { userId: payload.id },
    include: {
      students: {
        include: {
          user: true,
          enrollments: { include: { course: true } },
          attendances: { orderBy: { date: "desc" }, take: 10 },
          payments: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      },
    },
  });

  if (!parent) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Parent profile not found.</p>
      </div>
    );
  }

  // Stats calculation
  const totalChildren = parent.students.length;
  const totalEnrollments = parent.students.reduce(
    (sum, s) => sum + s.enrollments.length,
    0
  );

  // Overall attendance percentage for all children
  let totalPresent = 0;
  let totalAttendance = 0;
  parent.students.forEach((s) => {
    totalAttendance += s.attendances.length;
    totalPresent += s.attendances.filter((a) => a.status === "PRESENT").length;
  });
  const overallPercent =
    totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Welcome, {parent.students[0]?.user.name?.split(" ")[0] || "Parent"}.
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Here's how your child is doing.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Children</p>
            <Users size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{totalChildren}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Courses</p>
            <BookOpen size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{totalEnrollments}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Overall Attendance</p>
            <CalendarCheck size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{overallPercent}%</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Present</p>
            <CheckCircle size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-teal">{totalPresent}</p>
        </div>
      </div>

      {/* Children Cards */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0A1F37] dark:text-white">
            My Children
          </h2>
          <Link
            href="/dashboard/parent/children"
            className="text-xs font-semibold text-[#0D9488] hover:underline"
          >
            View All →
          </Link>
        </div>

        {parent.students.length === 0 ? (
          <div className="py-8 text-center">
            <Users size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No children linked to your account.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {parent.students.map((student) => {
              const present = student.attendances.filter((a) => a.status === "PRESENT").length;
              const total = student.attendances.length;
              const percent = total > 0 ? Math.round((present / total) * 100) : 0;

              return (
                <div
                  key={student.id}
                  className="p-4 rounded-lg border border-gray-100 dark:border-navy-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0A1F37] to-[#12345B] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {student.user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#0A1F37] dark:text-white truncate">
                        {student.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Grade {student.grade || "N/A"} • {student.enrollments.length} course
                        {student.enrollments.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-teal">{percent}%</p>
                      <p className="text-[10px] text-gray-500">Attendance</p>
                    </div>
                  </div>

                  {/* Course Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {student.enrollments.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className="text-[10px] font-semibold bg-teal/10 text-teal px-2 py-0.5 rounded truncate max-w-[180px]"
                      >
                        {e.course.title}
                      </span>
                    ))}
                    {student.enrollments.length > 3 && (
                      <span className="text-[10px] text-gray-400">
                        +{student.enrollments.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Attendance + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#0A1F37] dark:text-white flex items-center gap-2">
              <Clock size={16} className="text-teal" />
              Recent Attendance
            </h2>
            <Link
              href="/dashboard/parent/attendance"
              className="text-xs font-semibold text-[#0D9488] hover:underline"
            >
              View All
            </Link>
          </div>

          {parent.students.flatMap((s) => s.attendances).length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No attendance records yet.
            </p>
          ) : (
            <div className="space-y-2">
              {parent.students
                .flatMap((s) =>
                  s.attendances.map((a) => ({ ...a, studentName: s.user.name }))
                )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                        {a.studentName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(a.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
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
              href="/dashboard/parent/attendance"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors"
            >
              <span className="flex items-center gap-2">
                <CalendarCheck size={16} /> View Attendance
              </span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/dashboard/parent/payments"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors"
            >
              <span className="flex items-center gap-2">
                <CreditCard size={16} /> Fee Status
              </span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/dashboard/parent/children"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users size={16} /> My Children
              </span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}