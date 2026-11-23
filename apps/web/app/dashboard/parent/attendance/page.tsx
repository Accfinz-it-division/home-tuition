import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { AttendanceView } from "./attendance-view";
import { CalendarCheck } from "lucide-react";



export default async function ParentAttendancePage() {
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
          attendances: {
            orderBy: { date: "desc" },
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

  // Format data for client component
  const childrenData = parent.students.map((student) => ({
    id: student.id,
    name: student.user.name,
    grade: student.grade,
    courses: student.enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
    })),
    attendances: student.attendances.map((a) => ({
      id: a.id,
      date: a.date.toISOString(),
      status: a.status,
      courseId: a.courseId,
    })),
  }));

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Attendance Records
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View detailed attendance history for your children.
        </p>
      </div>

      {childrenData.length === 0 ? (
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-12 text-center">
          <CalendarCheck size={56} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-[#0A1F37] dark:text-white mb-2">
            No children linked
          </h3>
          <p className="text-sm text-gray-500">
            Contact admin to link your child's profile.
          </p>
        </div>
      ) : (
        <AttendanceView childrenData={childrenData} />
      )}
    </div>
  );
}