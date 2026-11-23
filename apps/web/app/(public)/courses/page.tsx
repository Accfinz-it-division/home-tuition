import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen } from "lucide-react";


export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: { teacher: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900">
      <section className="bg-navy py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Our Courses</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore live online courses for Grade 1–13, O/L, A/L, Government Exams, and Skill Courses.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No courses available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="block rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden hover:shadow-xl hover:border-teal transition-all bg-white dark:bg-navy-800"
                >
                  <div className="h-40 bg-gradient-to-br from-navy to-teal flex items-center justify-center">
                    <BookOpen className="text-white" size={48} />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-teal/10 text-teal font-semibold px-2 py-1 rounded">
                        {course.category}
                      </span>
                      {course.grade && (
                        <span className="text-xs bg-gold/20 text-gold-600 font-semibold px-2 py-1 rounded">
                          Grade {course.grade}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-navy dark:text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-navy-700">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">First class</p>
                        <p className="font-bold text-teal">Rs. {course.firstFee.toString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Regular</p>
                        <p className="font-bold text-navy dark:text-white">Rs. {course.regularFee.toString()}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}