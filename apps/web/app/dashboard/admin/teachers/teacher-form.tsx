"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  mode: "create" | "edit";
  teacherId?: string;
  defaultValues?: {
    name?: string;
    email?: string;
    phone?: string;
    nic?: string;
    qualifications?: string;
    bio?: string;
    status?: string;
    password?: string;
  };
};

export function TeacherForm({ mode, teacherId, defaultValues }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body: Record<string, any> = {
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      nic: fd.get("nic"),
      qualifications: fd.get("qualifications"),
      bio: fd.get("bio"),
      status: fd.get("status"),
    };
    if (mode === "create") body.password = fd.get("password");

    const url = mode === "create"
      ? "/api/admin/teachers"
      : `/api/admin/teachers/${teacherId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error || "Failed");

    router.push("/dashboard/admin/teachers");
    router.refresh();
  }

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 max-w-2xl">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy dark:text-white mb-1">Name *</label>
          <input name="name" required defaultValue={defaultValues?.name} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-900 text-navy dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy dark:text-white mb-1">Email *</label>
          <input name="email" type="email" required defaultValue={defaultValues?.email} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-900 text-navy dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy dark:text-white mb-1">Phone</label>
          <input name="phone" defaultValue={defaultValues?.phone} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-900 text-navy dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy dark:text-white mb-1">NIC</label>
          <input name="nic" defaultValue={defaultValues?.nic} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-900 text-navy dark:text-white" />
        </div>
        {mode === "create" && (
          <div>
            <label className="block text-sm font-medium text-navy dark:text-white mb-1">Password *</label>
            <input name="password" type="password" required minLength={6} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-900 text-navy dark:text-white" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-navy dark:text-white mb-1">Qualifications</label>
          <input name="qualifications" defaultValue={defaultValues?.qualifications} placeholder="e.g. BSc Mathematics, University of Colombo" className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-900 text-navy dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy dark:text-white mb-1">Bio</label>
          <textarea name="bio" rows={3} defaultValue={defaultValues?.bio} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-900 text-navy dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy dark:text-white mb-1">Status</label>
          <select name="status" defaultValue={defaultValues?.status || "PENDING"} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-900 text-navy dark:text-white">
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="bg-teal text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-600 disabled:opacity-60">
            {loading ? "Saving..." : mode === "create" ? "Create Teacher" : "Update Teacher"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg font-semibold border border-gray-300 dark:border-gray-600 text-navy dark:text-white hover:bg-gray-50 dark:hover:bg-navy-700">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}