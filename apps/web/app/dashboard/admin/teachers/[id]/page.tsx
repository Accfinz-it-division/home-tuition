import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TeacherActions } from "./teacher-actions";
import { Plus, Users, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
export const instant = false;

export default async function AdminTeachersPage() {
  const [teachers, pendingCount, verifiedCount] = await Promise.all([
    prisma.teacher.findMany({
      include: { user: true },
      orderBy: { user: { createdAt: "desc" } },
    }),
    prisma.teacher.count({ where: { status: "PENDING" } }),
    prisma.teacher.count({ where: { status: "VERIFIED" } }),
  ]);

  const statusBadge = (status: string) => {
    if (status === "VERIFIED")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-teal/10 text-teal px-2 py-1 rounded">
          Verified
        </span>
      );
    if (status === "PENDING")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#F59E0B]/10 text-[#D97706] px-2 py-1 rounded">
          Pending
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-1 rounded">
        Rejected
      </span>
    );
  };

  return (
    <div className="space-y-4">
      
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
            Teacher Verification
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage, verify, and review all teacher applications.
          </p>
        </div>
        <Link
          href="/dashboard/admin/teachers/new"
          className="flex items-center gap-2 bg-[#0D9488] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0F766E] transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Teacher
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Teachers</p>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{teachers.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Verified</p>
          <p className="text-2xl font-bold text-teal">{verifiedCount}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F59E0B]"></div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-[#D97706]">{pendingCount}</p>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC] dark:bg-[#0A1F37] border-b border-gray-200 dark:border-navy-700">
            <tr>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Teacher
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Qualifications
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
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Users size={40} className="mb-3 opacity-20" />
                    <p className="text-sm font-medium">No teachers found.</p>
                    <p className="text-xs mt-1">Click "Add Teacher" to create the first one.</p>
                  </div>
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {teacher.user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                          {teacher.user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{teacher.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {teacher.qualifications || "—"}
                  </td>
                  <td className="px-5 py-3">{statusBadge(teacher.status)}</td>
                  <td className="px-5 py-3">
                    <TeacherActions teacherId={teacher.id} currentStatus={teacher.status} />
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