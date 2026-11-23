import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { Users, Mail, Phone, BookOpen } from "lucide-react";




export default async function TeacherStudentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.id },
    include: {
      courses: {
        include: {
          enrollments: {
            include: {
              student: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!teacher) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Teacher profile not found.</p>
      </div>
    );
  }

  // Get unique students across all courses
  const allStudentsMap = new Map<string, {
    student: any;
    courses: string[];
  }>();

  teacher.courses.forEach((course) => {
    course.enrollments.forEach((enrollment) => {
      const studentId = enrollment.student.id;
      if (!allStudentsMap.has(studentId)) {
        allStudentsMap.set(studentId, {
          student: enrollment.student,
          courses: [],
        });
      }
      allStudentsMap.get(studentId)!.courses.push(course.title);
    });
  });

  const students = Array.from(allStudentsMap.values());

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Students
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          All students enrolled in your courses.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Unique Students</p>
            <Users size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{students.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Enrollments</p>
            <BookOpen size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            {students.reduce((sum, s) => sum + s.courses.length, 0)}
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC] dark:bg-[#0A1F37] border-b border-gray-200 dark:border-navy-700">
            <tr>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Student
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Enrolled Courses
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Users size={40} className="mb-3 opacity-20" />
                    <p className="text-sm font-medium">No students enrolled yet.</p>
                    <p className="text-xs mt-1">Students will appear here once they enroll in your courses.</p>
                  </div>
                </td>
              </tr>
            ) : (
              students.map(({ student, courses }) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#0A1F37] to-[#12345B] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {student.user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                          {student.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Grade {student.grade || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                      <p className="flex items-center gap-1.5">
                        <Mail size={12} className="text-gray-400" />
                        <span className="truncate">{student.user.email}</span>
                      </p>
                      {student.user.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" />
                          <span>{student.user.phone}</span>
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {courses.map((courseTitle, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold bg-teal/10 text-teal px-2 py-1 rounded truncate max-w-[180px]"
                        >
                          {courseTitle}
                        </span>
                      ))}
                    </div>
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