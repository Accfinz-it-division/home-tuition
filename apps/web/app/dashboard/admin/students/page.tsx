import { prisma } from "@/lib/prisma";
import { UserActions } from "./user-actions";
import { Users, GraduationCap, UserCheck, Shield } from "lucide-react";

export const instant = false;

export default async function AdminUsersPage() {
  const [users, totalStudents, totalParents, totalTeachers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "PARENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
  ]);

  const roleBadge = (role: string) => {
    if (role === "ADMIN")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-navy-100 text-navy px-2 py-1 rounded">
          Admin
        </span>
      );
    if (role === "TEACHER")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-gold-600 px-2 py-1 rounded">
          Teacher
        </span>
      );
    if (role === "STUDENT")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-teal/10 text-teal px-2 py-1 rounded">
          Student
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-600 px-2 py-1 rounded">
        Parent
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          All Users
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage all users on the platform.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Users</p>
            <Users size={16} className="text-[#0A1F37] dark:text-white" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Students</p>
            <GraduationCap size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-teal">{totalStudents}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Parents</p>
            <UserCheck size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-500">{totalParents}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Teachers</p>
            <Shield size={16} className="text-gold-600" />
          </div>
          <p className="text-2xl font-bold text-gold-600">{totalTeachers}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC] dark:bg-[#0A1F37] border-b border-gray-200 dark:border-navy-700">
            <tr>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Users size={40} className="mb-3 opacity-20" />
                    <p className="text-sm font-medium">No users found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#12345B] to-[#0A1F37] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">{roleBadge(user.role)}</td>
                  <td className="px-5 py-3">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-600 px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <UserActions userId={user.id} isActive={user.isActive} />
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