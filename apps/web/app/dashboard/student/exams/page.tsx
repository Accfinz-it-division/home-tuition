import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { FileText, Award } from "lucide-react";



export default async function StudentExamsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: payload.id },
    include: {
      marks: { include: { exam: { include: { course: true } } } },
    },
  });

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Student profile not found.</p>
      </div>
    );
  }

  const marks = student.marks.sort(
    (a, b) => new Date(b.exam.examDate).getTime() - new Date(a.exam.examDate).getTime()
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          My Marks
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View your exam results and performance.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6">
        {marks.length === 0 ? (
          <div className="py-12 text-center">
            <Award size={56} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">No exam marks yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {marks.map((mark) => {
              const percent = Math.round((mark.score / mark.exam.totalMarks) * 100);
              const isPass = percent >= 50;
              return (
                <div
                  key={mark.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-navy-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-teal" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                        {mark.exam.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {mark.exam.course.title} • {new Date(mark.exam.examDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-[#0A1F37] dark:text-white">
                      {mark.score} / {mark.exam.totalMarks}
                    </p>
                    <p className={`text-xs font-bold ${isPass ? "text-teal" : "text-red-500"}`}>
                      {percent}% ({isPass ? "Pass" : "Fail"})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}