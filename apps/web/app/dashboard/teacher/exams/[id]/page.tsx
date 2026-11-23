import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { MarksForm } from "./marks-form";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar } from "lucide-react";


export default async function EnterMarksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) redirect("/login");

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          enrollments: {
            include: { student: { include: { user: true } } },
          },
        },
      },
      marks: true,
    },
  });

  if (!exam) notFound();

  const students = exam.course.enrollments.map((e) => ({
    id: e.student.id,
    name: e.student.user.name,
    email: e.student.user.email,
  }));

  const existingMarks = exam.marks.reduce<Record<string, number>>((acc, m) => {
    acc[m.studentId] = m.score;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/dashboard/teacher/exams"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D9488] mb-2 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Exams
        </Link>
        <h1 className="text-2xl font-bold text-[#0A1F37] dark:text-white">
          {exam.title}
        </h1>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FileText size={12} /> {exam.course.title}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {new Date(exam.examDate).toLocaleDateString()}
          </span>
          <span>Total Marks: {exam.totalMarks}</span>
        </div>
      </div>

      <MarksForm
        examId={exam.id}
        totalMarks={exam.totalMarks}
        students={students}
        existingMarks={existingMarks}
      />
    </div>
  );
}