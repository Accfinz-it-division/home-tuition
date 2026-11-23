import { prisma } from "@/lib/prisma";
import { TeacherActions } from "./teacher-actions";
import { Award, Clock, XCircle, Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacher.findMany({
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } },
  });

  const statusBadge = (status: string) => {
    if (status === "VERIFIED")
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-teal/10 text-teal px-2 py-1 rounded">
          <Award size={12} /> Verified
        </span>
      );
    if (status === "PENDING")
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gold/20 text-gold-600 px-2 py-1 rounded">
          <Clock size={12} /> Pending
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded">
        <XCircle size={12} /> Rejected
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-white">Teachers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Verify and manage teachers
          </p>
        </div>
        <Link
          href="/dashboard/admin/teachers/new"
          className="flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-600 transition"
        >
          <Plus size={18} /> Add Teacher
        </Link>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-50 dark:bg-navy-700">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy dark:text-white uppercase">Teacher</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy dark:text-white uppercase">Qualifications</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-navy dark:text-white uppercase">Status</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-navy dark:text-white uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No teachers yet.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white font-bold">
                        {teacher.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-navy dark:text-white">{teacher.user.name}</p>
                        <p className="text-xs text-gray-500">{teacher.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {teacher.qualifications || "—"}
                  </td>
                  <td className="px-6 py-4">{statusBadge(teacher.status)}</td>
                  <td className="px-6 py-4 text-right">
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