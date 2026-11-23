import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// Route redirector based on logged-in user's role
const roleHome: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  PARENT: "/dashboard/parent",
};

export default async function DashboardRouter() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) redirect("/login");
  const payload = await verifyToken(token);
  if (!payload) redirect("/login");
  redirect(roleHome[payload.role] || "/login");
}