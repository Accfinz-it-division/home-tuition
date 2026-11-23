"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "PARENT" | "TEACHER">("STUDENT");
  const [isMinor, setIsMinor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-detect if student is under 18 based on DOB
  function onDobChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.value) return;
    const age =
      new Date().getFullYear() - new Date(e.target.value).getFullYear();
    setIsMinor(age < 18);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const body: any = {
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      nic: fd.get("nic"),
      dob: fd.get("dob"),
      password: fd.get("password"),
      role,
    };
    // Add student-specific fields
    if (role === "STUDENT") {
      body.grade = fd.get("grade");
      if (isMinor) body.parentNic = fd.get("parentNic");
    }

    // Call register API
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Registration failed");
    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-navy-50 dark:bg-navy-900 p-6">
      <div className="w-full max-w-lg bg-white dark:bg-navy-700 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-navy dark:text-white mb-2">
          Create Account
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Join Home Tuition today
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Role selector buttons */}
        <div className="flex gap-2 mb-6">
          {(["STUDENT", "PARENT", "TEACHER"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                role === r
                  ? "bg-teal text-white"
                  : "bg-navy-50 dark:bg-navy-800 text-navy dark:text-white"
              }`}
            >
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input name="name" placeholder="Full Name" required className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white" />
          <input name="email" type="email" placeholder="Email" required className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white" />
          <input name="phone" placeholder="Phone (e.g. 07XXXXXXXX)" className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white" />
          <input
            name="nic"
            placeholder="NIC (12 digits or 9 + V/X)"
            required={role !== "STUDENT"}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white"
          />

          {/* Student-specific fields */}
          {role === "STUDENT" && (
            <>
              <input name="dob" type="date" onChange={onDobChange} required className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white" />
              <input name="grade" type="number" min={1} max={13} placeholder="Grade (1-13)" required className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white" />
              {isMinor && (
                <input
                  name="parentNic"
                  placeholder="Parent NIC (required for under 18)"
                  required
                  className="w-full p-3 rounded-lg border border-gold bg-gold/10 text-navy dark:text-white"
                />
              )}
            </>
          )}

          <input name="password" type="password" placeholder="Password (min 6)" required className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white" />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal text-white font-semibold py-3 rounded-lg hover:bg-teal-600 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Link href="/login" className="text-teal font-semibold">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}