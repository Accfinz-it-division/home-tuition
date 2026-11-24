"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";

// Load PayHere SDK globally
declare global {
  interface Window {
    payhere: any;
  }
}

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
    setLoading(true);

    try {
      // Call API to create payment + get PayHere config
      const res = await fetch("/api/student/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, amount, month }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      const config = data.payhereConfig;

      // Load PayHere SDK if not loaded
      if (!window.payhere) {
        await loadPayHereSDK();
      }

      // Setup event handlers
      window.payhere.onCompleted = function (orderId: string) {
        console.log("Payment completed:", orderId);
        router.push(`/dashboard/student/payments?success=true&order=${orderId}`);
        router.refresh();
      };

      window.payhere.onDismissed = function () {
        console.log("Payment dismissed");
        setLoading(false);
        alert("Payment cancelled.");
      };

      window.payhere.onError = function (error: string) {
        console.error("Payment error:", error);
        setLoading(false);
        alert("Payment error: " + error);
      };

      // Start payment
      window.payhere.startPayment(config);
    } catch (err: any) {
      alert("❌ " + err.message);
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
          <Loader2 size={14} className="animate-spin" /> Loading...
        </>
      ) : (
        <>
          <CreditCard size={14} /> Pay Rs. {amount}
        </>
      )}
    </button>
  );
}

// Load PayHere SDK dynamically
function loadPayHereSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PayHere SDK"));
    document.body.appendChild(script);
  });
}