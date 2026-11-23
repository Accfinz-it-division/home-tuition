import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Award, CheckCircle } from "lucide-react";


export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: { teacher: { include: { user: true } }, resources: true },
  });
  if (!course) notFound();

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900">
      <section className="bg-navy py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/courses" className="text-teal text-sm mb-4 inline-block hover:underline">
            ← Back to Courses
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-teal text-white text-sm font-semibold px-3 py-1 rounded">
              {course.category}
            </span>
            {course.grade && (
              <span className="bg-gold text-navy text-sm font-semibold px-3 py-1 rounded">
                Grade {course.grade}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
          <p className="text-gray-300 text-lg">{course.description}</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-200 dark:border-navy-700 p-6 bg-white dark:bg-navy-800">
              <h2 className="text-2xl font-bold text-navy dark:text-white mb-4 flex items-center gap-2">
                <BookOpen size={24} className="text-teal" /> What You'll Learn
              </h2>
              <ul className="space-y-2">
                {[
                  "Complete syllabus coverage",
                  "Past paper discussions",
                  "Monthly exams with parent reports",
                  "Recorded classes if you miss",
                  "Full LMS access",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle size={18} className="text-teal mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-navy-700 p-6 bg-white dark:bg-navy-800">
              <h2 className="text-2xl font-bold text-navy dark:text-white mb-4 flex items-center gap-2">
                <User size={24} className="text-teal" /> Your Teacher
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {course.teacher.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-navy dark:text-white">{course.teacher.user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.teacher.qualifications}</p>
                  <p className="text-xs text-teal flex items-center gap-1 mt-1">
                    <Award size={12} /> Admin Verified
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="rounded-2xl border-2 border-teal p-6 bg-white dark:bg-navy-800 sticky top-24">
              <h3 className="text-xl font-bold text-navy dark:text-white mb-4">Course Fees</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">First Class</span>
                  <span className="text-2xl font-bold text-teal">Rs. {course.firstFee.toString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-navy-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Regular Fee</span>
                  <span className="text-lg font-bold text-navy dark:text-white">Rs. {course.regularFee.toString()}</span>
                </div>
              </div>
              <Link href="/register">
                <Button variant="primary" className="w-full mb-3">
                  Enroll Now
                </Button>
              </Link>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Pay once. Get full LMS access + recorded classes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}