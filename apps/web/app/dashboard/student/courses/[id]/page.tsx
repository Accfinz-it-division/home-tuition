import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Download,
  Lock,
  User,
  Award,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const instant = false;

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  // Get student + check enrollment
  const student = await prisma.student.findUnique({
    where: { userId: payload.id },
  });
  if (!student) redirect("/dashboard/student");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: { studentId: student.id, courseId: id },
    },
  });
  if (!enrollment) redirect("/dashboard/student/courses");

  // Check if student has paid for this month
  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-11"
  const payment = await prisma.payment.findFirst({
    where: {
      studentId: student.id,
      courseId: id,
      month: currentMonth,
      status: "PAID",
    },
  });
  const isPaid = !!payment;

  // Get course + resources
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      teacher: { include: { user: true } },
      resources: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!course) notFound();

  return (
    <div className="space-y-4">
      {/* Back + Header */}
      <div>
        <Link
          href="/dashboard/student/courses"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D9488] mb-2 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Courses
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-1">
              {course.title}
            </h1>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal/10 text-teal px-2 py-1 rounded">
                {course.category}
              </span>
              {course.grade && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-gold-600 px-2 py-1 rounded">
                  Grade {course.grade}
                </span>
              )}
            </div>
          </div>

          {/* Payment Status Badge */}
          {isPaid ? (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-600 px-3 py-1.5 rounded">
              ✓ Paid This Month
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-3 py-1.5 rounded">
              ⚠ Payment Required
            </span>
          )}
        </div>
      </div>

      {/* Payment Alert */}
      {!isPaid && (
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#D97706] text-sm mb-1">
              Payment pending for this month
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Pay your monthly fee to unlock LMS resources (notes, papers).
            </p>
          </div>
          <Link
            href="/dashboard/student/payments"
            className="bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#D97706] transition-colors whitespace-nowrap"
          >
            Pay Now
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Description */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              About this Course
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {course.description || "No description provided."}
            </p>
          </div>

          {/* LMS Resources */}
          <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText size={16} /> Learning Resources
              {!isPaid && <Lock size={12} className="text-red-500" />}
            </h2>

            {course.resources.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No resources uploaded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {course.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700 hover:border-teal transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-teal" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                          {resource.title}
                        </p>
                        <p className="text-xs text-gray-500 uppercase">
                          {resource.type}
                        </p>
                      </div>
                    </div>
                    {isPaid ? (
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-teal hover:underline px-2"
                      >
                        <Download size={14} /> Download
                      </a>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-400 px-2">
                        <Lock size={12} /> Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Teacher */}
          <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={14} /> Teacher
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-full flex items-center justify-center text-white font-bold">
                {course.teacher.user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#0A1F37] dark:text-white truncate">
                  {course.teacher.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {course.teacher.qualifications || "—"}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-navy-700 text-xs text-teal flex items-center gap-1">
              <Award size={12} /> Verified Teacher
            </div>
          </div>

          {/* Course Fee */}
          <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={14} /> Monthly Fee
            </h2>
            <p className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-1">
              Rs. {course.regularFee.toString()}
            </p>
            <p className="text-xs text-gray-500 mb-3">Due: {currentMonth}</p>
            {isPaid ? (
              <div className="bg-green-50 dark:bg-green-500/10 text-green-600 text-xs font-semibold text-center py-2 rounded-lg">
                ✓ Payment Confirmed
              </div>
            ) : (
              <Link
                href="/dashboard/student/payments"
                className="block bg-[#0D9488] text-white text-center py-2 rounded-lg text-sm font-semibold hover:bg-[#0F766E] transition-colors"
              >
                Pay Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}