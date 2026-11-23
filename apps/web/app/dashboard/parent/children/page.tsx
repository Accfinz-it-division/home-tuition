import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import { Users, ArrowRight, BookOpen, CalendarCheck } from "lucide-react";



export default async function ParentChildrenPage() {
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
          attendances: true,
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

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          My Children
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View profiles and progress of all your children.
        </p>
      </div>

      {/* Children Grid */}
      {parent.students.length === 0 ? (
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-12 text-center">
          <Users size={56} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-[#0A1F37] dark:text-white mb-2">
            No children linked
          </h3>
          <p className="text-sm text-gray-500">
            Contact admin to link your child's profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parent.students.map((student) => {
            const present = student.attendances.filter(
              (a) => a.status === "PRESENT"
            ).length;
            const total = student.attendances.length;
            const percent = total > 0 ? Math.round((present / total) * 100) : 0;

            return (
              <Link
                key={student.id}
                href={`/dashboard/parent/children/${student.id}`}
                className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6 hover:border-teal hover:shadow-lg transition-all group"
              >
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0A1F37] to-[#12345B] rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {student.user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg text-[#0A1F37] dark:text-white truncate group-hover:text-teal transition-colors">
                      {student.user.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {student.user.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Grade {student.grade || "N/A"}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-gray-400 group-hover:text-teal transition-colors flex-shrink-0"
                  />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#F8FAFC] dark:bg-[#0A1F37] p-3 rounded-lg">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                      <BookOpen size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Courses
                      </span>
                    </div>
                    <p className="text-lg font-bold text-[#0A1F37] dark:text-white">
                      {student.enrollments.length}
                    </p>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-[#0A1F37] p-3 rounded-lg">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                      <CalendarCheck size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Attendance
                      </span>
                    </div>
                    <p className="text-lg font-bold text-teal">{percent}%</p>
                  </div>
                </div>

                {/* Course Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {student.enrollments.slice(0, 2).map((e) => (
                    <span
                      key={e.id}
                      className="text-[10px] font-semibold bg-teal/10 text-teal px-2 py-1 rounded truncate max-w-[160px]"
                    >
                      {e.course.title}
                    </span>
                  ))}
                  {student.enrollments.length > 2 && (
                    <span className="text-[10px] text-gray-400 self-center">
                      +{student.enrollments.length - 2} more
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}