import { prisma } from "@/lib/prisma";
import { GraduationCap, Award } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    where: { status: "VERIFIED" },
    include: { user: true, courses: true },
  });

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900">
      <section className="bg-navy py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Our Teachers</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            All teachers on Home Tuition are admin-verified. Learn from Sri Lanka's best educators.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {teachers.length === 0 ? (
            <div className="text-center py-20">
              <GraduationCap size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No teachers available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="rounded-2xl border border-gray-200 dark:border-navy-700 p-6 bg-white dark:bg-navy-800 hover:border-teal transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {teacher.user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-navy dark:text-white">{teacher.user.name}</h3>
                      <p className="text-xs text-teal flex items-center gap-1 mt-1">
                        <Award size={12} /> Verified
                      </p>
                    </div>
                  </div>
                  {teacher.qualifications && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{teacher.qualifications}</p>
                  )}
                  {teacher.bio && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{teacher.bio}</p>
                  )}
                  <div className="pt-4 border-t border-gray-200 dark:border-navy-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Teaching {teacher.courses.length} course{teacher.courses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}