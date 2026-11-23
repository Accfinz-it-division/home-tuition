"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Course = { id: string; title: string };

export function ClassForm({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      courseId: fd.get("courseId"),
      title: fd.get("title"),
      startTime: fd.get("startTime"),
      endTime: fd.get("endTime"),
      link: fd.get("link"),
    };

    const res = await fetch("/api/admin/teacher/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error || "Failed");

    router.push("/dashboard/teacher/classes");
    router.refresh();
  }

  return (
    <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6 max-w-3xl">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Course *
          </label>
          <select
            name="courseId"
            required
            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          >
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Class Title *
          </label>
          <input
            name="title"
            required
            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Start Time *
            </label>
            <input
              name="startTime"
              type="datetime-local"
              required
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              End Time *
            </label>
            <input
              name="endTime"
              type="datetime-local"
              required
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Zoom Link *
          </label>
          <input
            name="link"
            type="url"
            required
            placeholder="https://zoom.us/j/..."
            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-navy-700">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0D9488] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0F766E] disabled:opacity-60 transition-colors"
          >
            {loading ? "Creating..." : "Schedule Class"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-gray-300 dark:border-navy-600 text-[#0A1F37] dark:text-white hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}