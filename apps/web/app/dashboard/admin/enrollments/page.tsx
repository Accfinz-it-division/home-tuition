import { prisma } from "@/lib/prisma";
import { EnrollmentActions } from "./enrollment-actions";
import { Users, CheckCircle, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEnrollmentsPage() {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: { include: { user: true } },
      course: { include: { teacher: { include: { user: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = enrollments.filter((e) => e.status === "PENDING");
  const approved = enrollments.filter((e) => e.status === "APPROVED");
  const rejected = enrollments.filter((e) => e.status === "REJECTED");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Enrollment Requests
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Approve or reject student enrollment requests.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F59E0B]"></div>
          <p className="text-xs font-medium text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-[#D97706]">{pending.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <p className="text-xs font-medium text-gray-500 mb-1">Approved</p>
          <p className="text-2xl font-bold text-teal">{approved.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <p className="text-xs font-medium text-gray-500 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-500">{rejected.length}</p>
        </div>
      </div>

      {/* Enrollments List */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 overflow-hidden">
        {enrollments.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No enrollment requests yet.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] dark:bg-[#0A1F37] border-b border-gray-200 dark:border-navy-700">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-sm text-[#0A1F37] dark:text-white">
                      {e.student.user.name}
                    </p>
                    <p className="text-xs text-gray-500">{e.student.user.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                      {e.course.title}
                    </p>
                    <p className="text-xs text-gray-500">By {e.course.teacher.user.name}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    {e.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-[#F59E0B]/10 text-[#D97706] px-2 py-1 rounded">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                    {e.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-teal/10 text-teal px-2 py-1 rounded">
                        <CheckCircle size={12} /> Approved
                      </span>
                    )}
                    {e.status === "REJECTED" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-red-100 text-red-600 px-2 py-1 rounded">
                        <XCircle size={12} /> Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <EnrollmentActions enrollmentId={e.id} status={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}