"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

type Student = { id: string; name: string; email: string };

export function MarksForm({
  examId,
  totalMarks,
  students,
  existingMarks,
}: {
  examId: string;
  totalMarks: number;
  students: Student[];
  existingMarks: Record<string, number>;
}) {
  const router = useRouter();
  const [marks, setMarks] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    students.forEach((s) => {
      initial[s.id] = existingMarks[s.id]?.toString() || "";
    });
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateMark(studentId: string, value: string) {
    setMarks((prev) => ({ ...prev, [studentId]: value }));
  }

  async function handleSubmit() {
    const records = Object.entries(marks)
      .filter(([_, v]) => v !== "" && !isNaN(Number(v)))
      .map(([studentId, score]) => ({
        studentId,
        score: Number(score),
      }));

    if (records.length === 0) {
      setMessage("❌ Please enter at least one mark");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/teacher/exams/${examId}/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage("✅ Marks saved successfully!");
      router.refresh();
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
      {students.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          No students enrolled in this course.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {students.map((student) => {
              const val = marks[student.id];
              const numVal = Number(val);
              const isValid = val !== "" && !isNaN(numVal) && numVal >= 0 && numVal <= totalMarks;

              return (
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

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={totalMarks}
                      step="0.5"
                      value={val}
                      onChange={(e) => updateMark(student.id, e.target.value)}
                      placeholder="0"
                      className={`w-20 p-2 rounded-lg border text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#14B8A6] ${
                        val === ""
                          ? "border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white"
                          : isValid
                          ? "border-teal bg-teal/5 text-teal"
                          : "border-red-300 bg-red-50 text-red-600"
                      }`}
                    />
                    <span className="text-xs text-gray-500 w-8">
                      / {totalMarks}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

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
                  <CheckCircle size={14} /> Save Marks
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}