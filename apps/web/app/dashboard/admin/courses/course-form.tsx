"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Teacher = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  courseId?: string;
  teachers: Teacher[];
  defaultValues?: {
    title?: string;
    category?: string;
    subject?: string;
    grade?: number | null;
    medium?: string;
    description?: string;
    firstFee?: number;
    regularFee?: number;
    teacherId?: string;
  };
};

// Category options
const categoryOptions = [
  { value: "PRIMARY", label: "Primary (Grade 1-5)" },
  { value: "SECONDARY", label: "Secondary (Grade 6-9)" },
  { value: "OL", label: "O/L (Grade 10-11)" },
  { value: "AL", label: "A/L (Grade 12-13)" },
  { value: "LANGUAGE", label: "Language Courses" },
  { value: "GOV_EXAM", label: "Government Exams" },
  { value: "SKILL", label: "Skill Courses" },
];

// Subject suggestions per category
const subjectSuggestions: Record<string, string[]> = {
  PRIMARY: ["Mathematics", "Sinhala", "Tamil", "English", "Environment"],
  SECONDARY: ["Mathematics", "Science", "Sinhala", "Tamil", "English", "History", "Geography"],
  OL: ["Mathematics", "Science", "Sinhala", "Tamil", "English", "History", "Commerce", "ICT"],
  AL: ["Combined Maths", "Physics", "Chemistry", "Biology", "Economics", "Accounting", "Business Studies", "ICT", "English"],
  LANGUAGE: ["Spoken English", "Spoken Tamil", "Spoken Sinhala", "IELTS", "TOEFL"],
  GOV_EXAM: ["General Knowledge", "Grama Sevaka", "Police Exam", "Army Exam"],
  SKILL: ["Web Development", "Graphic Design", "Digital Marketing", "Photography"],
};

export function CourseForm({ mode, courseId, teachers, defaultValues }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(defaultValues?.category || "OL");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      category: fd.get("category"),
      subject: fd.get("subject"),
      grade: fd.get("grade") ? parseInt(fd.get("grade") as string) : null,
      medium: fd.get("medium") || null,
      description: fd.get("description"),
      firstFee: parseFloat(fd.get("firstFee") as string),
      regularFee: parseFloat(fd.get("regularFee") as string),
      teacherId: fd.get("teacherId"),
    };

    const url = mode === "create" ? "/api/admin/courses" : `/api/admin/courses/${courseId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error || "Failed");

    router.push("/dashboard/admin/courses");
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
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Course Title *
          </label>
          <input
            name="title"
            required
            defaultValue={defaultValues?.title}
            placeholder="e.g. Grade 10 Mathematics"
            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        {/* Category + Grade */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              name="category"
              required
              defaultValue={defaultValues?.category || "OL"}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Grade (Optional)
            </label>
            <input
              name="grade"
              type="number"
              min={1}
              max={13}
              defaultValue={defaultValues?.grade || ""}
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>
        </div>

        {/* Subject + Medium */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Subject *
            </label>
            <input
              name="subject"
              required
              list="subject-suggestions"
              defaultValue={defaultValues?.subject}
              placeholder="e.g. Mathematics"
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
            <datalist id="subject-suggestions">
              {subjectSuggestions[selectedCategory]?.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Medium *
            </label>
            <select
              name="medium"
              required
              defaultValue={defaultValues?.medium || ""}
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            >
              <option value="">Select medium</option>
              <option value="SINHALA">Sinhala</option>
              <option value="TAMIL">Tamil</option>
              <option value="ENGLISH">English</option>
            </select>
          </div>
        </div>

        {/* Teacher */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Teacher *
          </label>
          <select
            name="teacherId"
            required
            defaultValue={defaultValues?.teacherId || ""}
            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          >
            <option value="">Select a teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={defaultValues?.description}
            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        {/* Fees */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              First Class Fee (Rs.) *
            </label>
            <input
              name="firstFee"
              type="number"
              required
              min={0}
              defaultValue={defaultValues?.firstFee || ""}
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Regular Fee (Rs.) *
            </label>
            <input
              name="regularFee"
              type="number"
              required
              min={0}
              defaultValue={defaultValues?.regularFee || ""}
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-navy-600 bg-white dark:bg-[#0A1F37] text-[#0A1F37] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-navy-700">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0D9488] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0F766E] disabled:opacity-60 transition-colors"
          >
            {loading ? "Saving..." : mode === "create" ? "Create Course" : "Update Course"}
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