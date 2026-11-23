import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PaymentActions } from "./payment-actions";
import { CreditCard, TrendingUp, Clock, CheckCircle } from "lucide-react";


export default async function AdminPaymentsPage() {
  const [payments, totalPaid, totalPending] = await Promise.all([
    prisma.payment.findMany({
      include: {
        student: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const revenue = totalPaid._sum.amount?.toString() || "0";
  const paidCount = totalPaid._count || 0;
  const pendingCount = totalPending._count || 0;

  const statusBadge = (status: string) => {
    if (status === "PAID")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-teal/10 text-teal px-2 py-1 rounded">
          Paid
        </span>
      );
    if (status === "PENDING")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#F59E0B]/10 text-[#D97706] px-2 py-1 rounded">
          Pending
        </span>
      );
    if (status === "FAILED")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-1 rounded">
          Failed
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Payments
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage and verify all student payments.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
            <TrendingUp size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">Rs. {revenue}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Paid</p>
            <CheckCircle size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-teal">{paidCount}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F59E0B]"></div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending</p>
            <Clock size={16} className="text-[#D97706]" />
          </div>
          <p className="text-2xl font-bold text-[#D97706]">{pendingCount}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC] dark:bg-[#0A1F37] border-b border-gray-200 dark:border-navy-700">
            <tr>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Student
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Month
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <CreditCard size={40} className="mb-3 opacity-20" />
                    <p className="text-sm font-medium">No payments yet.</p>
                    <p className="text-xs mt-1">Payments will appear here once students enroll.</p>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {payment.student.user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                          {payment.student.user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {payment.student.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {payment.month}
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-[#0A1F37] dark:text-white">
                    Rs. {payment.amount.toString()}
                  </td>
                  <td className="px-5 py-3">{statusBadge(payment.status)}</td>
                  <td className="px-5 py-3">
                    <PaymentActions
                      paymentId={payment.id}
                      currentStatus={payment.status}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
