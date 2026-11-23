import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { AttendanceForm } from "./attendance-form";
import { CalendarCheck, Users } from "lucide-react";


export default async function TeacherAttendancePage() {
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
            include: { student: { include: { user: true } } },
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

  // Format courses for the client component
  const courseOptions = teacher.courses.map((course) => ({
    id: course.id,
    title: course.title,
    students: course.enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.user.name,
      email: e.student.user.email,
    })),
  }));

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Mark Attendance
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select a course and date to mark student attendance.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">My Courses</p>
            <CalendarCheck size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{courseOptions.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Students</p>
            <Users size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            {courseOptions.reduce((sum, c) => sum + c.students.length, 0)}
          </p>
        </div>
      </div>

      {/* Attendance Form */}
      {courseOptions.length === 0 ? (
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-12 text-center">
          <CalendarCheck size={56} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-[#0A1F37] dark:text-white mb-2">
            No courses assigned
          </h3>
          <p className="text-sm text-gray-500">
            You need at least one course to mark attendance.
          </p>
        </div>
      ) : (
        <AttendanceForm courses={courseOptions} />
      )}
    </div>
  );
}