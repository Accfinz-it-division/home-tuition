"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export function TeacherActions({
  teacherId,
  currentStatus,
}: {
  teacherId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/admin/teachers/${teacherId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function deleteTeacher() {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/teachers/${teacherId}`, {
      method: "DELETE",
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert("Failed to delete");
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* Verify / Revoke Button */}
      {currentStatus !== "VERIFIED" ? (
        <button
          disabled={loading}
          onClick={() => updateStatus("VERIFIED")}
          className="flex items-center gap-1 text-[11px] font-semibold bg-[#0D9488] text-white px-2.5 py-1.5 rounded-md hover:bg-[#0F766E] disabled:opacity-50 transition-colors"
        >
          <Check size={12} /> Verify
        </button>
      ) : (
        <button
          disabled={loading}
          onClick={() => updateStatus("REJECTED")}
          className="text-[11px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 px-2"
        >
          Revoke
        </button>
      )}

      {/* Icon Buttons */}
      <Link
        href={`/dashboard/admin/teachers/${teacherId}`}
        className="p-1.5 text-gray-400 hover:text-[#0A1F37] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-700 rounded-md transition-colors"
        title="View"
      >
        <Eye size={14} />
      </Link>
      <Link
        href={`/dashboard/admin/teachers/${teacherId}/edit`}
        className="p-1.5 text-gray-400 hover:text-[#0A1F37] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-700 rounded-md transition-colors"
        title="Edit"
      >
        <Pencil size={14} />
      </Link>
      <button
        onClick={deleteTeacher}
        disabled={loading}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}