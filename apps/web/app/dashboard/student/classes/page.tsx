import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  PlayCircle,
  Lock,
  ExternalLink,
} from "lucide-react";


export default async function StudentClassesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: payload.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              teacher: { include: { user: true } },
              zoomMeetings: {
                orderBy: { startTime: "desc" },
              },
            },
          },
        },
      },
      payments: true,
    },
  });

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Student profile not found.</p>
      </div>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const now = new Date();

  // Flatten all classes from all enrolled courses
  const allClasses = student.enrollments.flatMap((e) =>
    e.course.zoomMeetings.map((m) => ({
      ...m,
      course: e.course,
      isPaid: student.payments.some(
        (p) =>
          p.courseId === e.course.id &&
          p.month === currentMonth &&
          p.status === "PAID"
      ),
    }))
  );

  const upcoming = allClasses
    .filter((c) => new Date(c.startTime) >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const past = allClasses
    .filter((c) => new Date(c.endTime) < now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Live Classes
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Join upcoming classes or watch recordings of past classes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Upcoming</p>
            <Calendar size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{upcoming.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Past Classes</p>
            <PlayCircle size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{past.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Enrolled Courses</p>
            <Video size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{student.enrollments.length}</p>
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-teal" /> Upcoming Classes
        </h2>

        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No upcoming classes scheduled.
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-navy-700 hover:border-teal transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video size={20} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                      {cls.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {cls.course.title} • {cls.course.teacher.user.name}
                    </p>
                    <p className="text-xs text-teal flex items-center gap-1 mt-1">
                      <Clock size={10} />
                      {new Date(cls.startTime).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>

                {cls.isPaid ? (
                  <a
                    href={cls.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-[#0D9488] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0F766E] transition-colors whitespace-nowrap"
                  >
                    <ExternalLink size={14} /> Join Class
                  </a>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                      <Lock size={12} /> Locked
                    </span>
                    <Link
                      href="/dashboard/student/payments"
                      className="text-[10px] text-[#0D9488] font-semibold hover:underline"
                    >
                      Pay to unlock
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Classes (Recordings) */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <PlayCircle size={16} className="text-teal" /> Past Classes & Recordings
        </h2>

        {past.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No past classes available yet.
          </p>
        ) : (
          <div className="space-y-3">
            {past.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-navy-700 hover:border-teal transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-navy-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlayCircle size={20} className="text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                      {cls.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {cls.course.title} • {new Date(cls.startTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {cls.isPaid && cls.recordingUrl ? (
                  <a
                    href={cls.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-[#0A1F37] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#12345B] transition-colors whitespace-nowrap"
                  >
                    <PlayCircle size={14} /> Watch
                  </a>
                ) : cls.isPaid && !cls.recordingUrl ? (
                  <span className="text-xs text-gray-400 px-3">Recording pending</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                    <Lock size={12} /> Locked
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
