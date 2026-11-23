"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Award, // ✅ Exam icon
  LogOut,
  ExternalLink,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard/parent", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/parent/children", label: "My Children", icon: Users },
  { href: "/dashboard/parent/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/dashboard/parent/exams", label: "Exam Marks", icon: Award }, // ✅ Added
  { href: "/dashboard/parent/payments", label: "Payments", icon: CreditCard },
];

export function ParentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 min-h-screen bg-[#0A1F37] border-r border-gray-200 dark:border-navy-700 flex flex-col flex-shrink-0">
      <div className="p-6 pb-8 border-b border-white/10 dark:border-navy-700">
        <h1 className="text-2xl font-bold text-white tracking-tight">Home Tuition</h1>
        <p className="text-[10px] text-[#E4B85B] font-bold tracking-[0.15em] mt-1">
          PARENT PORTAL
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#0D9488] text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-1 mt-auto border-t border-white/10 dark:border-navy-700">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ExternalLink size={18} />
          Visit Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}