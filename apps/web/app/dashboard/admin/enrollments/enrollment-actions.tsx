"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export function EnrollmentActions({
  enrollmentId,
  status,
}: {
  enrollmentId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/admin/enrollments/${enrollmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  if (status === "APPROVED") {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        disabled={loading}
        onClick={() => updateStatus("APPROVED")}
        className="flex items-center gap-1 text-[11px] font-semibold bg-[#0D9488] text-white px-2.5 py-1.5 rounded-md hover:bg-[#0F766E] disabled:opacity-50"
      >
        <Check size={12} /> Approve
      </button>
      <button
        disabled={loading}
        onClick={() => updateStatus("REJECTED")}
        className="flex items-center gap-1 text-[11px] font-semibold bg-red-100 text-red-600 px-2.5 py-1.5 rounded-md hover:bg-red-200 disabled:opacity-50"
      >
        <X size={12} /> Reject
      </button>
    </div>
  );
}