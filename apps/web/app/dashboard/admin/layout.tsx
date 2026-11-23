import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";


export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload || payload.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0A1F37]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white dark:bg-[#0E2846] border-b border-gray-200 dark:border-navy-700 px-6 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
            Admin Workspace <span className="mx-2 text-gray-300">/</span> Overview
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content - Left Aligned, No max-w */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}