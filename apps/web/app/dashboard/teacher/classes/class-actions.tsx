"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ExternalLink } from "lucide-react";

export function ClassActions({
  classId,
  isPast,
  link,
}: {
  classId: string;
  isPast: boolean;
  link: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this class?")) return;
    setLoading(true);
    await fetch(`/api/admin/teacher/classes/${classId}`, {
      method: "DELETE",
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {!isPast && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-teal/10 text-teal px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-teal/20 transition-colors whitespace-nowrap"
        >
          <ExternalLink size={12} /> Join
        </a>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}