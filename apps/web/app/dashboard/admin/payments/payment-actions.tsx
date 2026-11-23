"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export function PaymentActions({
  paymentId,
  currentStatus,
}: {
  paymentId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/admin/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  if (currentStatus === "PAID" || currentStatus === "REFUNDED") {
    return (
      <div className="text-right text-xs text-gray-400">—</div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        disabled={loading}
        onClick={() => updateStatus("PAID")}
        className="flex items-center gap-1 text-[11px] font-semibold bg-[#0D9488] text-white px-2.5 py-1.5 rounded-md hover:bg-[#0F766E] disabled:opacity-50 transition-colors"
      >
        <Check size={12} /> Verify
      </button>
      <button
        disabled={loading}
        onClick={() => updateStatus("FAILED")}
        className="flex items-center gap-1 text-[11px] font-semibold bg-red-100 text-red-600 px-2.5 py-1.5 rounded-md hover:bg-red-200 disabled:opacity-50 transition-colors"
      >
        <X size={12} /> Reject
      </button>
    </div>
  );
}