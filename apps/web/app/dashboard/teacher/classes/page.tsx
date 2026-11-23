import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import { Video, Clock, Plus, PlayCircle } from "lucide-react";
import { ClassActions } from "./class-actions";

;


export default async function TeacherClassesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.id },
    include: {
      courses: {
        include: {
          zoomMeetings: {
            orderBy: { startTime: "desc" },
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

  // Flatten all meetings
  const allMeetings = teacher.courses.flatMap((course) =>
    course.zoomMeetings.map((m) => ({
      ...m,
      courseTitle: course.title,
    }))
  );

  const now = new Date();
  const upcoming = allMeetings
    .filter((m) => new Date(m.startTime) >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const past = allMeetings
    .filter((m) => new Date(m.endTime) < now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
            Live Classes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Schedule and manage live Zoom classes.
          </p>
        </div>
        <Link
          href="/dashboard/teacher/classes/new"
          className="flex items-center gap-2 bg-[#0D9488] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0F766E] transition-colors shadow-sm"
        >
          <Plus size={16} /> Schedule Class
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Upcoming Classes</p>
            <Clock size={16} className="text-teal" />
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
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock size={16} className="text-teal" /> Upcoming Classes
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
                      {cls.courseTitle}
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
                <ClassActions classId={cls.id} isPast={false} link={cls.link} />
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
            No past classes available.
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
                      {cls.courseTitle} • {new Date(cls.startTime).toLocaleDateString()}
                    </p>
                    {cls.recordingUrl ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-teal/10 text-teal px-2 py-0.5 rounded mt-1 inline-block">
                        Recording Available
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F59E0B]/10 text-[#D97706] px-2 py-0.5 rounded mt-1 inline-block">
                        Recording Pending
                      </span>
                    )}
                  </div>
                </div>
                <ClassActions classId={cls.id} isPast={true} link={cls.link} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}