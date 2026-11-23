import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import Link from "next/link";
import { FileText, Plus, Calendar, Users, ArrowRight } from "lucide-react";



export default async function TeacherExamsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: payload.id },
    include: {
      courses: {
        include: {
          exams: {
            include: {
              _count: { select: { marks: true } },
            },
            orderBy: { examDate: "desc" },
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

  const allExams = teacher.courses.flatMap((course) =>
    course.exams.map((e) => ({ ...e, courseTitle: course.title }))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
            Exams & Marks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create exams and enter marks for your students.
          </p>
        </div>
        <Link
          href="/dashboard/teacher/exams/new"
          className="flex items-center gap-2 bg-[#0D9488] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0F766E] transition-colors shadow-sm"
        >
          <Plus size={16} /> Create Exam
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0E2846] p-4 rounded-xl border border-gray-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Exams</p>
            <FileText size={16} className="text-teal" />
          </div>
          <p className="text-2xl font-bold text-[#0A1F37] dark:text-white">{allExams.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 overflow-hidden">
        {allExams.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={56} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0A1F37] dark:text-white mb-2">
              No exams created
            </h3>
            <p className="text-sm text-gray-500">
              Click "Create Exam" to schedule your first exam.
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] dark:bg-[#0A1F37] border-b border-gray-200 dark:border-navy-700">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exam</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marks</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {allExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                      {exam.title}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{exam.courseTitle}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(exam.examDate).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-gray-500">
                      {exam._count.marks} entered
                    </p>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/dashboard/teacher/exams/${exam.id}`}
                      className="text-xs font-semibold text-teal hover:underline flex items-center justify-end gap-1"
                    >
                      Enter Marks <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}