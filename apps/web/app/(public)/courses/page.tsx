import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, GraduationCap, School, Globe, Shield, Zap, Search } from "lucide-react";

export const dynamic = "force-dynamic";

// Category definitions
const categories = [
  { key: "PRIMARY", label: "Primary (1-5)", icon: School, color: "from-teal to-teal-600" },
  { key: "SECONDARY", label: "Secondary (6-9)", icon: BookOpen, color: "from-blue-500 to-blue-600" },
  { key: "OL", label: "O/L (10-11)", icon: GraduationCap, color: "from-gold to-gold-600" },
  { key: "AL", label: "A/L (12-13)", icon: GraduationCap, color: "from-navy to-navy-700" },
  { key: "LANGUAGE", label: "Languages", icon: Globe, color: "from-purple-500 to-purple-600" },
  { key: "GOV_EXAM", label: "Gov Exams", icon: Shield, color: "from-red-500 to-red-600" },
  { key: "SKILL", label: "Skill Courses", icon: Zap, color: "from-green-500 to-green-600" },
];

// Medium labels
const mediumLabels: Record<string, string> = {
  SINHALA: "Sinhala",
  TAMIL: "Tamil",
  ENGLISH: "English",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; medium?: string }>;
}) {
  const { category, medium } = await searchParams;
  const selectedCategory = (category?.toUpperCase() || "PRIMARY") as any;
  const selectedMedium = medium?.toUpperCase() || "";

  // Fetch courses for selected category
  const courses = await prisma.course.findMany({
    where: {
      category: selectedCategory,
      ...(selectedMedium && { medium: selectedMedium as any }),
    },
    include: { teacher: { include: { user: true } } },
    orderBy: [{ subject: "asc" }, { grade: "asc" }],
  });

  // Group by subject
  const groupedBySubject: Record<string, typeof courses> = {};
  courses.forEach((course) => {
    const subject = course.subject || "General";
    if (!groupedBySubject[subject]) groupedBySubject[subject] = [];
    groupedBySubject[subject].push(course);
  });

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900">
      {/* Header */}
      <section className="bg-navy py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Our Courses</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore live online tuition for Grade 1-13, O/L, A/L, Languages, Government Exams, and Skill Courses.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-white dark:bg-navy-900 border-b border-gray-200 dark:border-navy-700 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.key;
              return (
                <Link
                  key={cat.key}
                  href={`/courses?category=${cat.key}`}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                      : "bg-gray-100 dark:bg-navy-800 text-navy dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700"
                  }`}
                >
                  <Icon size={16} />
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Medium Filter */}
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Medium:</span>
            <Link
              href={`/courses?category=${selectedCategory}`}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                !selectedMedium
                  ? "bg-navy text-white"
                  : "bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              All
            </Link>
            {Object.entries(mediumLabels).map(([key, label]) => (
              <Link
                key={key}
                href={`/courses?category=${selectedCategory}&medium=${key}`}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedMedium === key
                    ? "bg-teal text-white"
                    : "bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Course List (Grouped by Subject) */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {courses.length === 0 ? (
            <div className="text-center py-20">
              <Search size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-semibold">
                No courses found
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Try selecting a different category or medium.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedBySubject).map(([subject, subjectCourses]) => (
                <div key={subject}>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-teal/30">
                    <BookOpen className="text-teal" size={24} />
                    <h2 className="text-2xl font-bold text-navy dark:text-white">
                      {subject}
                    </h2>
                    <span className="text-sm text-gray-500">
                      ({subjectCourses.length} course{subjectCourses.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjectCourses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="block rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden hover:shadow-xl hover:border-teal transition-all bg-white dark:bg-navy-800 group"
                      >
                        <div className="h-32 bg-gradient-to-br from-navy to-teal flex items-center justify-center relative">
                          <BookOpen className="text-white opacity-80 group-hover:scale-110 transition-transform" size={40} />
                          {course.medium && (
                            <span className="absolute top-2 right-2 text-[10px] font-bold uppercase bg-white/20 backdrop-blur text-white px-2 py-0.5 rounded">
                              {mediumLabels[course.medium]}
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            {course.grade && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal/10 text-teal px-2 py-0.5 rounded">
                                Grade {course.grade}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-navy dark:text-white mb-2 line-clamp-2 group-hover:text-teal transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-navy-700">
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">First</p>
                              <p className="font-bold text-teal">Rs. {course.firstFee.toString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Regular</p>
                              <p className="font-bold text-navy dark:text-white">Rs. {course.regularFee.toString()}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
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