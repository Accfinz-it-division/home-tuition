import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { TeacherSidebar } from "@/components/layout/teacher-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { prisma } from "@/lib/prisma";




export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload || payload.role !== "TEACHER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { name: true, email: true },
  });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0A1F37]">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-[#0E2846] border-b border-gray-200 dark:border-navy-700 px-6 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
            Teacher Portal <span className="mx-2 text-gray-300">/</span> Dashboard
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-8 h-8 bg-gradient-to-br from-[#E4B85B] to-[#C99B3D] rounded-full flex items-center justify-center text-white font-bold text-xs">
              {user?.name.charAt(0).toUpperCase() || "T"}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}