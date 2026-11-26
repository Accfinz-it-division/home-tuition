"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, GraduationCap, Users, UserCheck, Loader2 } from "lucide-react";

type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

const roles = [
  { key: "ADMIN", label: "Admin", icon: Shield, color: "from-navy to-navy-700" },
  { key: "TEACHER", label: "Teacher", icon: GraduationCap, color: "from-gold to-gold-600" },
  { key: "STUDENT", label: "Student", icon: Users, color: "from-teal to-teal-600" },
  { key: "PARENT", label: "Parent", icon: UserCheck, color: "from-purple-500 to-purple-600" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
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

    // Verify role matches
    if (selectedRole && data.role !== selectedRole) {
      setError(`This account is not a ${selectedRole.toLowerCase()}. Please select the correct role.`);
      return;
    }

    // Redirect based on role
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
          Select your role to continue
        </p>

        {/* Role Selector */}
        {!selectedRole ? (
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-navy-600 hover:border-teal hover:bg-teal/5 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-navy dark:text-white">
                    {role.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedRole(null);
                setError("");
              }}
              className="text-sm text-gray-500 hover:text-teal mb-4 flex items-center gap-1"
            >
              ← Choose different role
            </button>

            {/* Selected role indicator */}
            <div className="bg-teal/10 border border-teal/30 rounded-lg p-3 mb-4 flex items-center gap-2">
              {(() => {
                const role = roles.find((r) => r.key === selectedRole)!;
                const Icon = role.icon;
                return (
                  <>
                    <Icon size={16} className="text-teal" />
                    <span className="text-sm font-semibold text-teal">
                      Logging in as {role.label}
                    </span>
                  </>
                );
              })()}
            </div>

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
                className="w-full bg-teal text-white font-semibold py-3 rounded-lg hover:bg-teal-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </>
        )}

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