import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  CreditCard,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";


export default async function ParentChildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const parent = await prisma.parent.findUnique({
    where: { userId: payload.id },
  });
  if (!parent) redirect("/dashboard/parent");

  // Ensure this child belongs to this parent
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      enrollments: {
        include: {
          course: { include: { teacher: { include: { user: true } } } },
        },
      },
      attendances: {
        orderBy: { date: "desc" },
        take: 20,
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!student || student.parentId !== parent.id) notFound();

  // Stats
  const present = student.attendances.filter((a) => a.status === "PRESENT").length;
  const total = student.attendances.length;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;

  const totalPaid = student.payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-4">
      {/* Back Link */}
      <Link
        href="/dashboard/parent/children"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D9488] transition-colors"
      >
        <ArrowLeft size={14} /> Back to Children
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0A1F37] to-[#12345B] rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {student.user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white">
              {student.user.name}
            </h1>
            <p className="text-sm text-gray-500">Grade {student.grade || "N/A"}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Mail size={12} /> {student.user.email}
              </span>
              {student.user.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {student.user.phone}
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
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Attendance</p>
            <CalendarCheck size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{percent}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {present}/{total} classes
          </p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Enrolled Courses</p>
            <BookOpen size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            {student.enrollments.length}
          </p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Paid</p>
            <CreditCard size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            Rs. {totalPaid}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enrolled Courses */}
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen size={14} className="text-teal" /> Enrolled Courses
          </h2>
          {student.enrollments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No courses enrolled.</p>
          ) : (
            <div className="space-y-2">
              {student.enrollments.map((e) => (
                <div
                  key={e.id}
                  className="p-3 rounded-lg border border-gray-100 dark:border-navy-700"
                >
                  <p className="font-semibold text-sm text-[#0A1F37] dark:text-white">
                    {e.course.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {e.course.category} • {e.course.teacher.user.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CreditCard size={14} className="text-teal" /> Recent Payments
          </h2>
          {student.payments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No payments yet.</p>
          ) : (
            <div className="space-y-2">
              {student.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700"
                >
                  <div>
                    <p className="font-semibold text-sm text-[#0A1F37] dark:text-white">
                      Rs. {p.amount.toString()}
                    </p>
                    <p className="text-xs text-gray-500">{p.month}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                      p.status === "PAID"
                        ? "bg-teal/10 text-teal"
                        : p.status === "FAILED"
                        ? "bg-red-100 text-red-600"
                        : "bg-[#F59E0B]/10 text-[#D97706]"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CalendarCheck size={14} className="text-teal" /> Attendance History
        </h2>
        {student.attendances.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            No attendance records yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {student.attendances.map((a) => {
              const course = student.enrollments.find(
                (e) => e.courseId === a.courseId
              )?.course;
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-navy-700"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0A1F37] dark:text-white truncate">
                      {course?.title || "Course"}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(a.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
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