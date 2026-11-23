"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export function CourseActions({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function deleteCourse() {
    if (!confirm("Are you sure you want to delete this course?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "DELETE",
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert("Failed to delete");
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/dashboard/admin/courses/${courseId}`}
        className="p-1.5 text-gray-400 hover:text-[#0A1F37] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-700 rounded-md transition-colors"
        title="View"
      >
        <Eye size={14} />
      </Link>
      <Link
        href={`/dashboard/admin/courses/${courseId}/edit`}
        className="p-1.5 text-gray-400 hover:text-[#0A1F37] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-700 rounded-md transition-colors"
        title="Edit"
      >
        <Pencil size={14} />
      </Link>
      <button
        onClick={deleteCourse}
        disabled={loading}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}