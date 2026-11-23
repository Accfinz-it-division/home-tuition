"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";

export function PayButton({
  courseId,
  courseTitle,
  amount,
  month,
}: {
  courseId: string;
  courseTitle: string;
  amount: number;
  month: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    if (!confirm(`Pay Rs. ${amount} for ${courseTitle} (${month})?\n\nThis is a demo payment.`)) return;
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/student/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, amount, month }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      router.refresh();
      alert("✅ Payment successful! LMS unlocked for this month.");
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="flex items-center gap-1.5 bg-[#0D9488] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0F766E] transition-colors whitespace-nowrap disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" /> Processing...
        </>
      ) : (
        <>
          <CreditCard size={14} /> Pay Rs. {amount}
        </>
      )}
    </button>
  );
}