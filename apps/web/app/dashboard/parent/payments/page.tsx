import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  BookOpen,
  Users,
} from "lucide-react";



export default async function ParentPaymentsPage() {
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
          payments: {
            orderBy: { createdAt: "desc" },
          },
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

  // Flatten all payments across children with student info
  const allPayments = parent.students.flatMap((student) =>
    student.payments.map((p) => {
      const course = student.enrollments.find(
        (e) => e.courseId === p.courseId
      )?.course;
      return {
        ...p,
        studentName: student.user.name,
        studentId: student.id,
        courseTitle: course?.title || "Course",
      };
    })
  );

  // Sort by date desc
  allPayments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Stats
  const totalPaid = allPayments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const paidCount = allPayments.filter((p) => p.status === "PAID").length;
  const pendingCount = allPayments.filter((p) => p.status === "PENDING").length;
  const failedCount = allPayments.filter((p) => p.status === "FAILED").length;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Payments
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View all fee payments across your children.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Paid</p>
            <TrendingUp size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            Rs. {totalPaid}
          </p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Paid</p>
            <CheckCircle size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-teal">{paidCount}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending</p>
            <Clock size={16} className="text-[#D97706]" />
          </div>
          <p className="text-2xl font-bold text-[#D97706]">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Failed</p>
            <XCircle size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500">{failedCount}</p>
        </div>
      </div>

      {/* Child-wise Payment Summary */}
      {parent.students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parent.students.map((student) => {
            const childPayments = student.payments;
            const childPaid = childPayments
              .filter((p) => p.status === "PAID")
              .reduce((sum, p) => sum + Number(p.amount), 0);
            const childPaidCount = childPayments.filter(
              (p) => p.status === "PAID"
            ).length;
            const childPendingCount = childPayments.filter(
              (p) => p.status === "PENDING"
            ).length;

            return (
              <Link
                key={student.id}
                href={`/dashboard/parent/children/${student.id}`}
                className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6 hover:border-teal transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0A1F37] to-[#12345B] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {student.user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0A1F37] dark:text-white truncate group-hover:text-teal transition-colors">
                        {student.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Grade {student.grade || "N/A"}
                      </p>
                    </div>
                  </div>
                  <CreditCard size={20} className="text-gray-300" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Paid</span>
                    <span className="font-bold text-[#0A1F37] dark:text-white">
                      Rs. {childPaid}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Paid Payments</span>
                    <span className="font-semibold text-teal">
                      {childPaidCount}
                    </span>
                  </div>
                  {childPendingCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pending</span>
                      <span className="font-semibold text-[#D97706]">
                        {childPendingCount}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* All Payments History */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CreditCard size={14} className="text-teal" /> Payment History
          ({allPayments.length})
        </h2>

        {allPayments.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 dark:border-navy-700">
                <tr>
                  <th className="px-2 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="px-2 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-2 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-2 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-2 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                {allPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 dark:hover:bg-navy-700/30 transition-colors"
                  >
                    <td className="px-2 py-3">
                      <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                        {p.studentName}
                      </p>
                    </td>
                    <td className="px-2 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {p.courseTitle}
                      </p>
                    </td>
                    <td className="px-2 py-3">
                      <p className="text-sm text-gray-500">{p.month}</p>
                    </td>
                    <td className="px-2 py-3">
                      <p className="font-bold text-sm text-[#0A1F37] dark:text-white">
                        Rs. {p.amount.toString()}
                      </p>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                          p.status === "PAID"
                            ? "bg-teal/10 text-teal"
                            : p.status === "FAILED"
                            ? "bg-red-100 text-red-600"
                            : "bg-[#F59E0B]/10 text-[#D97706]"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}