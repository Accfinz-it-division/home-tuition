"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    // Call login API
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Login failed");

    // Redirect to role-based dashboard
    const map: Record<string, string> = {
      ADMIN: "/dashboard/admin",
      TEACHER: "/dashboard/teacher",
      STUDENT: "/dashboard/student",
      PARENT: "/dashboard/parent",
    };
    router.push(map[data.role]);
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-navy-50 dark:bg-navy-900 p-6">
      <div className="w-full max-w-md bg-white dark:bg-navy-700 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-navy dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Login to your Home Tuition account
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal text-white font-semibold py-3 rounded-lg hover:bg-teal-600 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Don't have an account?{" "}
          <Link href="/register" className="text-teal font-semibold">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}