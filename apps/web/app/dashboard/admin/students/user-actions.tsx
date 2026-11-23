"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserActions({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="text-right">
      <button
        disabled={loading}
        onClick={toggleActive}
        className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50 ${
          isActive
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-[#0D9488] text-white hover:bg-[#0F766E]"
        }`}
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}