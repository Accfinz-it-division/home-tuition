import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { ResourceForm } from "./resource-form";
import { ResourceActions } from "./resource-actions";
import { FileText, Download, BookOpen } from "lucide-react";


export default async function TeacherResourcesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.id },
    include: {
      courses: {
        include: {
          resources: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!teacher) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Teacher profile not found.</p>
      </div>
    );
  }

  // Flatten all resources
  const allResources = teacher.courses.flatMap((course) =>
    course.resources.map((r) => ({
      ...r,
      courseTitle: course.title,
    }))
  );

  const courseOptions = teacher.courses.map((c) => ({
    id: c.id,
    title: c.title,
  }));

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
            Learning Resources
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload and manage notes, past papers, and quizzes for your students.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Resources</p>
            <FileText size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{allResources.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">My Courses</p>
            <BookOpen size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{teacher.courses.length}</p>
        </div>
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Downloads</p>
            <Download size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">—</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upload Form (Left) */}
        <div className="lg:col-span-1">
          <ResourceForm courses={courseOptions} />
        </div>

        {/* Resource List (Right) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={16} className="text-teal" /> All Resources ({allResources.length})
            </h2>

            {allResources.length === 0 ? (
              <div className="py-12 text-center">
                <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No resources uploaded yet.</p>
                <p className="text-xs text-gray-400 mt-1">Use the form on the left to add your first resource.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allResources.map((r) => {
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
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${badge.className}`}>
                              {badge.label}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate">{r.courseTitle}</span>
                          </div>
                        </div>
                      </div>
                      <ResourceActions resourceId={r.id} fileUrl={r.fileUrl} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}