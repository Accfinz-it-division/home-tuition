import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { FileText, Award } from "lucide-react";



export default async function ParentExamsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const parent = await prisma.parent.findUnique({
    where: { userId: payload.id },
    include: {
      students: {
        include: {
          user: true,
          marks: { include: { exam: { include: { course: true } } } },
        },
      },
    },
  });

  if (!parent) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Parent profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white mb-0.5">
          Exam Marks
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View your children's exam results.
        </p>
      </div>

      {parent.students.map((student) => (
        <div
          key={student.id}
          className="bg-white dark:bg-[#0E2846] rounded-xl border border-gray-200 dark:border-navy-700 p-6"
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-navy-700">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0A1F37] to-[#12345B] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {student.user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#0A1F37] dark:text-white truncate">
                {student.user.name}
              </p>
              <p className="text-xs text-gray-500">Grade {student.grade || "N/A"}</p>
            </div>
          </div>

          {student.marks.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No exam marks yet.</p>
          ) : (
            <div className="space-y-2">
              {student.marks
                .sort((a, b) => new Date(b.exam.examDate).getTime() - new Date(a.exam.examDate).getTime())
                .map((mark) => {
                  const percent = Math.round((mark.score / mark.exam.totalMarks) * 100);
                  return (
                    <div
                      key={mark.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-navy-700"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0A1F37] dark:text-white truncate">
                          {mark.exam.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {mark.exam.course.title} • {new Date(mark.exam.examDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-bold text-[#0A1F37] dark:text-white">
                          {mark.score}/{mark.exam.totalMarks}
                        </p>
                        <p className={`text-xs font-bold ${percent >= 50 ? "text-teal" : "text-red-500"}`}>
                          {percent}%
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}