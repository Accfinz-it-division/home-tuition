"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";

export function ResourceActions({
  resourceId,
  fileUrl,
}: {
  resourceId: string;
  fileUrl: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this resource?")) return;
    setLoading(true);
    await fetch(`/api/admin/teacher/resources/${resourceId}`, {
      method: "DELETE",
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-gray-400 hover:text-teal hover:bg-teal/10 rounded-md transition-colors"
        title="Open"
      >
        <ExternalLink size={14} />
      </a>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}