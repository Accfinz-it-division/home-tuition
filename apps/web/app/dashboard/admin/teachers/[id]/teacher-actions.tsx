"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

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

  return (
    <div className="flex items-center gap-2">
      {currentStatus === "VERIFIED" ? (
        <span className="text-xs font-semibold text-teal flex items-center gap-1">
          <Check size={12} /> Verified
        </span>
      ) : (
        <button
          disabled={loading}
          onClick={() => updateStatus("VERIFIED")}
          className="text-xs bg-teal text-white px-2 py-1 rounded hover:bg-teal-600 disabled:opacity-50"
        >
          Verify
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("REJECTED")}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Reject
        </button>
      )}
    </div>
  );
}