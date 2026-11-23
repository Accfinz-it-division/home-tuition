import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import {
  FileText,
  Download,
  Lock,
  BookOpen,
  AlertCircle,
} from "lucide-react";


export const instant = false;

export default async function StudentResourcesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: payload.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              resources: { orderBy: { createdAt: "desc" } },
            },
          },
        },
      },
      payments: true,
    },
  });

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Student profile not found.</p>
      </div>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Group resources by course, with paid status
  const courseResources = student.enrollments.map((e) => {
    const isPaid = student.payments.some(
      (p) =>
        p.courseId === e.courseId &&
        p.month === currentMonth &&
        p.status === "PAID"
    );
    return {
      course: e.course,
      resources: e.course.resources,
      isPaid,
    };
  });

  const totalResources = courseResources.reduce((sum, c) => sum + c.resources.length, 0);
  const lockedCount = courseResources
    .filter((c) => !c.isPaid)
    .reduce((sum, c) => sum + c.resources.length, 0);

  const getTypeBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t === "note") return { label: "Note", className: "bg-teal/10 text-teal" };
    if (t === "past_paper" || t === "pastpaper")
      return { label: "Past Paper", className: "bg-purple-100 text-purple-600" };
    if (t === "model_paper" || t === "modelpaper")
      return { label: "Model Paper", className: "bg-gold/20 text-gold-600" };
    if (t === "quiz") return { label: "Quiz", className: "bg-blue-100 text-blue-600" };
    if (t === "syllabus") return { label: "Syllabus", className: "bg-gray-200 text-gray-700" };
    return { label: type, className: "bg-gray-100 text-gray-600" };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          LMS Resources
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Download notes, past papers, model papers, and quizzes for your courses.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Resources</p>
            <FileText size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{totalResources}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Available</p>
            <Download size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-teal">{totalResources - lockedCount}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Locked</p>
            <Lock size={16} className="text-[#D97706]" />
          </div>
          <p className="text-2xl font-bold text-[#D97706]">{lockedCount}</p>
        </div>
      </div>

      {/* Alert for locked resources */}
      {lockedCount > 0 && (
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-[#D97706] flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-[#D97706] text-sm mb-1">
              {lockedCount} resource{lockedCount > 1 ? "s" : ""} locked
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Pay your monthly fees to unlock all resources.
            </p>
          </div>
          <Link
            href="/dashboard/student/payments"
            className="bg-[#F59E0B] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#D97706] transition-colors whitespace-nowrap"
          >
            Pay Now
          </Link>
        </div>
      )}

      {/* Resources by Course */}
      {courseResources.length === 0 ? (
        <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-12 text-center">
          <BookOpen size={56} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-[#0A1F37] dark:text-white mb-2">
            No resources yet
          </h3>
          <p className="text-sm text-gray-500">
            Enroll in a course to access learning materials.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {courseResources.map(({ course, resources, isPaid }) => (
            <div
              key={course.id}
              className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6"
            >
              {/* Course Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-navy-700">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#12345B] to-[#0A1F37] rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#0A1F37] dark:text-white truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {course.category} • {resources.length} resource{resources.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                {isPaid ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal/10 text-teal px-2.5 py-1 rounded">
                    ✓ Paid
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F59E0B]/10 text-[#D97706] px-2.5 py-1 rounded">
                    ⚠ Locked
                  </span>
                )}
              </div>

              {/* Resources List */}
              {resources.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No resources uploaded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {resources.map((r) => {
                    const badge = getTypeBadge(r.type);
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700 hover:border-teal transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-teal" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                              {r.title}
                            </p>
                            <span
                              className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                        </div>

                        {isPaid ? (
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-[#0D9488] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0F766E] transition-colors whitespace-nowrap"
                          >
                            <Download size={12} /> Download
                          </a>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-500 font-semibold px-2">
                            <Lock size={12} /> Locked
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}