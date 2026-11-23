"use client";

import { useState, useMemo } from "react";
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BookOpen,
} from "lucide-react";

type Attendance = {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  courseId: string;
};

type Course = { id: string; title: string };

type Child = {
  id: string;
  name: string;
  grade: number | null;
  courses: Course[];
  attendances: Attendance[];
};

export function AttendanceView({ childrenData }: { childrenData: Child[] }) {
  const [selectedChildId, setSelectedChildId] = useState(childrenData[0]?.id);
  const selectedChild = childrenData.find((c) => c.id === selectedChildId)!;

  // Compute stats
  const stats = useMemo(() => {
    const total = selectedChild.attendances.length;
    const present = selectedChild.attendances.filter((a) => a.status === "PRESENT").length;
    const absent = selectedChild.attendances.filter((a) => a.status === "ABSENT").length;
    const late = selectedChild.attendances.filter((a) => a.status === "LATE").length;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, percent };
  }, [selectedChild]);

  // Per-course stats
  const courseStats = useMemo(() => {
    return selectedChild.courses.map((course) => {
      const courseAttendances = selectedChild.attendances.filter(
        (a) => a.courseId === course.id
      );
      const present = courseAttendances.filter((a) => a.status === "PRESENT").length;
      const total = courseAttendances.length;
      const percent = total > 0 ? Math.round((present / total) * 100) : 0;
      return { course, present, total, percent };
    });
  }, [selectedChild]);

  return (
    <div className="space-y-4">
      {/* Child Selector */}
      {childrenData.length > 1 && (
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-4">
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Select Child
          </label>
          <div className="flex flex-wrap gap-2">
            {childrenData.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedChildId === child.id
                    ? "bg-[#0D9488] text-white"
                    : "bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedChildId === child.id ? "bg-white/20" : "bg-gray-300 text-gray-700"
                }`}>
                  {child.name.charAt(0)}
                </div>
                {child.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Overall</p>
            <TrendingUp size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">
            {stats.percent}%
          </p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Present</p>
            <CheckCircle size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-teal">{stats.present}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Absent</p>
            <XCircle size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Late</p>
            <Clock size={16} className="text-[#D97706]" />
          </div>
          <p className="text-2xl font-bold text-[#D97706]">{stats.late}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Per-Course Stats */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen size={14} className="text-teal" /> By Course
          </h2>

          {courseStats.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No courses enrolled.
            </p>
          ) : (
            <div className="space-y-4">
              {courseStats.map(({ course, present, total, percent }) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-[#0A1F37] dark:text-white truncate">
                      {course.title}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-500 flex-shrink-0 ml-2">
                      {present}/{total}
                    </p>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percent >= 75
                          ? "bg-teal"
                          : percent >= 50
                          ? "bg-[#F59E0B]"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarCheck size={14} className="text-teal" /> Attendance History
          </h2>

          {selectedChild.attendances.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              No attendance records yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {selectedChild.attendances.map((a) => {
                const course = selectedChild.courses.find(
                  (c) => c.id === a.courseId
                );
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CalendarCheck size={16} className="text-teal" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                          {course?.title || "Course"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(a.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex-shrink-0 ${
                        a.status === "PRESENT"
                          ? "bg-teal/10 text-teal"
                          : a.status === "LATE"
                          ? "bg-[#F59E0B]/10 text-[#D97706]"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}