import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";


export default async function AdminOverview() {
  const [totalUsers, verifiedTeachers, pendingTeachers, totalPayments] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.teacher.count({ where: { status: "VERIFIED" } }),
      prisma.teacher.count({ where: { status: "PENDING" } }),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

  const monthlyRevenue = totalPayments._sum.amount?.toString() || "0";

  return (
    <div className="space-y-4"> {/* Overall section spacing */}
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Welcome back, Admin.
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Here is the platform overview for today.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Students</p>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{totalUsers}</p>
        </div>

        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Verified Teachers</p>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{verifiedTeachers}</p>
        </div>

        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F59E0B]"></div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Approvals</p>
          <p className="text-2xl font-bold text-[#D97706]">{pendingTeachers}</p>
        </div>

        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Monthly Revenue</p>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">Rs. {monthlyRevenue}</p>
        </div>
      </div>

      {/* Main Grid - Trust Banner + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Trust Banner */}
        <div className="lg:col-span-2 bg-[#0A1F37] dark:bg-[#0E2846] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">
              Platform Trust
            </p>
            <h2 className="text-xl font-bold text-white mb-2">
              Good teaching begins with trust.
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
              You have {pendingTeachers} teacher application{pendingTeachers !== 1 ? 's' : ''} waiting for review. 
              Verify their documents and interview them to maintain platform quality.
            </p>
          </div>
          
          <Link 
            href="/dashboard/admin/teachers"
            className="inline-flex items-center text-[#E4B85B] font-semibold text-sm mt-4 hover:text-[#F0C976] transition-colors"
          >
            Review Applications <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[#0E2846] rounded-xl p-4 border border-gray-200 dark:border-navy-700">
          <h3 className="text-base font-bold text-[#0A1F37] dark:text-white mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/dashboard/admin/courses/new" className="block w-full text-left px-3 py-2 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors">
              + Add New Course
            </Link>
            <Link href="/dashboard/admin/teachers" className="block w-full text-left px-3 py-2 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors">
              Verify Teachers
            </Link>
            <Link href="/dashboard/admin/payments" className="block w-full text-left px-3 py-2 rounded-lg border border-gray-200 dark:border-navy-600 text-sm font-medium text-[#0A1F37] dark:text-gray-200 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors">
              View Payments
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Teacher Applications */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-[#0A1F37] dark:text-white">Pending Teacher Applications</h3>
          <Link href="/dashboard/admin/teachers" className="text-sm font-semibold text-[#0D9488] hover:underline">
            View All
          </Link>
        </div>
        <div className="py-6 text-center border-t border-gray-100 dark:border-navy-700">
          <p className="text-gray-400 text-sm">No pending applications right now.</p>
        </div>
      </div>
    </div>
  );
}
