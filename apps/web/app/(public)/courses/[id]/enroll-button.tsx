"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

export function EnrollButton({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "enrolled" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleEnroll() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        if (data.error === "Already enrolled") {
          setStatus("enrolled");
          setMessage("You are already enrolled in this course.");
          return;
        }
        if (data.error === "Enrollment pending") {
          setStatus("pending");
          setMessage("Your enrollment request is pending admin approval.");
          return;
        }
        if (data.error === "Unauthorized") {
          router.push("/login");
          return;
        }
        setStatus("error");
        setMessage(data.error || "Enrollment failed");
        return;
      }

      setStatus("pending");
      setMessage("Enrollment request sent! Waiting for admin approval.");
      router.refresh();
    } catch (err) {
      setLoading(false);
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  return (
    <div className="space-y-3">
      {status === "enrolled" ? (
        <div className="bg-green-50 dark:bg-green-500/10 text-green-600 text-center py-3 rounded-lg text-sm font-semibold">
          ✓ {message}
        </div>
      ) : status === "pending" ? (
        <div className="bg-[#F59E0B]/10 text-[#D97706] text-center py-3 rounded-lg text-sm font-semibold">
          ⏳ {message}
        </div>
      ) : (
        <button
          onClick={handleEnroll}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#0D9488] text-white py-3 rounded-lg font-semibold hover:bg-[#0F766E] disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Requesting...
            </>
          ) : (
            <>
              <CheckCircle size={16} /> Enroll Now
            </>
          )}
        </button>
      )}
      {status === "error" && message && (
        <div className="bg-red-50 text-red-600 text-center py-2 rounded-lg text-xs">
          ❌ {message}
        </div>
      )}
    </div>
  );
}