"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Plus } from "lucide-react";

type Course = { id: string; title: string };

export function ResourceForm({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = {
      courseId: fd.get("courseId"),
      title: fd.get("title"),
      type: fd.get("type"),
      fileUrl: fd.get("fileUrl"),
    };

    const res = await fetch("/api/admin/teacher/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to upload");
      return;
    }

    form.reset();
    setSuccess("✅ Resource uploaded successfully!");
    router.refresh();
    setTimeout(() => setSuccess(""), 3000);
  }

  return (
    <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6 sticky top-20">
      <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Upload size={16} className="text-teal" /> Upload Resource
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-2.5 rounded-lg mb-3 text-xs border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-2.5 rounded-lg mb-3 text-xs border border-green-200">
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
            Course *
          </label>
          <select
            name="courseId"
            required
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
            Title *
          </label>
          <input
            name="title"
            required
            placeholder="e.g. Chapter 1 Notes"
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
            Type *
          </label>
          <select
            name="type"
            required
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          >
            <option value="note">Note</option>
            <option value="past_paper">Past Paper</option>
            <option value="model_paper">Model Paper</option>
            <option value="quiz">Quiz</option>
            <option value="syllabus">Syllabus</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
            File URL *
          </label>
          <input
            name="fileUrl"
            type="url"
            required
            placeholder="https://drive.google.com/..."
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Paste a Google Drive, Dropbox, or PDF link.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#0D9488] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0F766E] disabled:opacity-60 transition-colors mt-2"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Plus size={14} /> Upload Resource
            </>
          )}
        </button>
      </form>
    </div>
  );
}