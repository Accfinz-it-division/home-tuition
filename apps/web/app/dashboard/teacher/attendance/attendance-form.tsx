"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

type Student = { id: string; name: string; email: string };
type Course = { id: string; title: string; students: Student[] };

export function AttendanceForm({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || "");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const currentCourse = courses.find((c) => c.id === selectedCourse);

  // When course or date changes, reset attendance state
  useEffect(() => {
    if (currentCourse) {
      const initial: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
      currentCourse.students.forEach((s) => {
        initial[s.id] = "PRESENT"; // Default to present
      });
      setAttendance(initial);
    }
  }, [selectedCourse]);

  function mark(studentId: string, status: "PRESENT" | "ABSENT" | "LATE") {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  }

  async function handleSubmit() {
    if (!currentCourse || Object.keys(attendance).length === 0) return;
    setLoading(true);
    setMessage("");

    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    try {
      const res = await fetch("/api/admin/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          date,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setMessage("✅ Attendance saved successfully!");
      router.refresh();
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function setAll(status: "PRESENT" | "ABSENT") {
    if (!currentCourse) return;
    const updated: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
    currentCourse.students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendance(updated);
  }

  return (
    <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Select Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.students.length} students)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {currentCourse && currentCourse.students.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setAll("PRESENT")}
            className="text-xs font-semibold text-teal hover:underline"
          >
            Mark All Present
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => setAll("ABSENT")}
            className="text-xs font-semibold text-red-500 hover:underline"
          >
            Mark All Absent
          </button>
        </div>
      )}

      {/* Students List */}
      {!currentCourse || currentCourse.students.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          No students enrolled in this course.
        </p>
      ) : (
        <div className="space-y-2">
          {currentCourse.students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-gradient-to-br from-[#0A1F37] to-[#12345B] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{student.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => mark(student.id, "PRESENT")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                    attendance[student.id] === "PRESENT"
                      ? "bg-teal text-white"
                      : "bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 hover:bg-teal/10"
                  }`}
                >
                  <CheckCircle size={12} /> Present
                </button>
                <button
                  type="button"
                  onClick={() => mark(student.id, "ABSENT")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                    attendance[student.id] === "ABSENT"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 hover:bg-red-50"
                  }`}
                >
                  <XCircle size={12} /> Absent
                </button>
                <button
                  type="button"
                  onClick={() => mark(student.id, "LATE")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                    attendance[student.id] === "LATE"
                      ? "bg-[#F59E0B] text-white"
                      : "bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 hover:bg-[#F59E0B]/10"
                  }`}
                >
                  <Clock size={12} /> Late
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      {currentCourse && currentCourse.students.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-navy-700 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {message && <span>{message}</span>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-[#0D9488] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0F766E] disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <CheckCircle size={14} /> Save Attendance
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}