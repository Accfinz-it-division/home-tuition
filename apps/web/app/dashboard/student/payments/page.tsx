import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { PayButton } from "./pay-button";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  BookOpen,
  AlertCircle,
} from "lucide-react";




export default async function StudentPaymentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: payload.id },
    include: {
      enrollments: {
        include: {
          course: true,
        },
      },
      payments: {
        include: { student: { include: { user: true } } },
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

  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-11"
  const paidCount = student.payments.filter((p) => p.status === "PAID").length;
  const pendingCount = student.payments.filter((p) => p.status === "PENDING").length;
  const totalPaid = student.payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Check which courses need payment for current month
  const coursesNeedingPayment = student.enrollments.filter((e) => {
    return !student.payments.some(
      (p) =>
        p.courseId === e.courseId &&
        p.month === currentMonth &&
        p.status === "PAID"
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Payments
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your monthly course fees and payment history.
        </p>
      </div>

      {/* Unpaid Alert */}
      {coursesNeedingPayment.length > 0 && (
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-[#D97706] flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-[#D97706] text-sm mb-1">
              {coursesNeedingPayment.length} course{coursesNeedingPayment.length > 1 ? "s" : ""} need payment for {currentMonth}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Pay to unlock LMS resources and join live classes.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Paid</p>
            <CheckCircle size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">Rs. {totalPaid}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Paid Months</p>
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
      </div>

      {/* Courses Needing Payment */}
      {coursesNeedingPayment.length > 0 && (
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-[#D97706]" /> Payment Due ({currentMonth})
          </h2>
          <div className="space-y-3">
            {coursesNeedingPayment.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between p-4 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#12345B] to-[#0A1F37] rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                      {e.course.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {e.course.category} • Fee: Rs. {e.course.regularFee.toString()}
                    </p>
                  </div>
                </div>
                <PayButton
                  courseId={e.courseId}
                  courseTitle={e.course.title}
                  amount={Number(e.course.regularFee)}
                  month={currentMonth}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Payment History
        </h2>

        {student.payments.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No payments yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {student.payments.map((p) => {
              const course = student.enrollments.find(
                (e) => e.courseId === p.courseId
              )?.course;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        p.status === "PAID"
                          ? "bg-teal/10"
                          : p.status === "FAILED"
                          ? "bg-red-100"
                          : "bg-[#F59E0B]/10"
                      }`}
                    >
                      {p.status === "PAID" ? (
                        <CheckCircle size={16} className="text-teal" />
                      ) : p.status === "FAILED" ? (
                        <XCircle size={16} className="text-red-600" />
                      ) : (
                        <Clock size={16} className="text-[#D97706]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                        {course?.title || "Course"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.month} •{" "}
                        {new Date(p.createdAt).toLocaleDateString("en-US", {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-bold text-sm text-[#0A1F37] dark:text-white">
                      Rs. {p.amount.toString()}
                    </p>
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}