import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  Video,
  CreditCard,
  ArrowRight,
  Clock,
} from "lucide-react";




export default async function StudentOverview() {
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
      },
      attendances: { orderBy: { date: "desc" }, take: 5 },
      payments: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Student profile not found.</p>
      </div>
    );
  }

  const totalCourses = student.enrollments.length;
  const presentCount = student.attendances.filter((a) => a.status === "PRESENT").length;
  const paidCount = student.payments.filter((p) => p.status === "PAID").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Welcome, {payload.email.split("@")[0]}.
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Here's your learning overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Enrolled Courses</p>
            <BookOpen size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{totalCourses}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Present Classes</p>
            <CalendarCheck size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{presentCount}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Paid Months</p>
            <CreditCard size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{paidCount}</p>
        </div>
      </div>

      {/* Courses Grid + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#0A1F37] dark:text-white">My Courses</h2>
            <Link href="/dashboard/student/courses" className="text-xs font-semibold text-[#0D9488] hover:underline">
              View All →
            </Link>
          </div>
          {student.enrollments.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Not enrolled in any courses yet.</p>
              <Link href="/courses" className="inline-block mt-3 text-sm font-semibold text-[#0D9488] hover:underline">
                Browse Courses →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {student.enrollments.slice(0, 4).map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-navy-700 hover:border-teal transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#12345B] to-[#0A1F37] rounded-lg flex items-center justify-center">
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                      {e.course.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {e.course.teacher.user.name} • {e.course.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-base font-bold text-[#0A1F37] dark:text-white mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/dashboard/student/classes" className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors">
              <span className="flex items-center gap-2"><Video size={16} /> Join Live Class</span>
              <ArrowRight size={14} />
            </Link>
            <Link href="/dashboard/student/attendance" className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors">
              <span className="flex items-center gap-2"><CalendarCheck size={16} /> My Attendance</span>
              <ArrowRight size={14} />
            </Link>
            <Link href="/dashboard/student/payments" className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors">
              <span className="flex items-center gap-2"><CreditCard size={16} /> Pay Fee</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0A1F37] dark:text-white flex items-center gap-2">
            <Clock size={16} className="text-[#0D9488]" />
            Recent Attendance
          </h2>
          <Link href="/dashboard/student/attendance" className="text-xs font-semibold text-[#0D9488] hover:underline">
            View All
          </Link>
        </div>
        {student.attendances.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No attendance records yet.</p>
        ) : (
          <div className="space-y-2">
            {student.attendances.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700">
                <p className="text-sm text-[#0A1F37] dark:text-white">
                  {new Date(a.date).toLocaleDateString()}
                </p>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                  a.status === "PRESENT" ? "bg-teal/10 text-teal" :
                  a.status === "LATE" ? "bg-[#F59E0B]/10 text-[#D97706]" :
                  "bg-red-100 text-red-600"
                }`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}