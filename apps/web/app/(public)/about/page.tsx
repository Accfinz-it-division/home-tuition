import { ShieldCheck, Target, Users, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-navy-900">
      <section className="bg-navy py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">About Home Tuition</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Sri Lanka's most trusted online tuition platform — built to solve the trust problem of online learning.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We believe every Sri Lankan student deserves access to high-quality tuition from the best teachers,
              regardless of where they live. Home Tuition brings verified teachers, live classes, complete LMS, and
              transparent parent tracking — all from the comfort of home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: ShieldCheck, title: "Trust First", desc: "Admin-verified teachers, verified payments, and parent alerts at every step." },
              { icon: Target, title: "Student Success", desc: "Monthly exams, recorded classes, and full LMS access to ensure no student is left behind." },
              { icon: Users, title: "Parent Partnership", desc: "Live attendance, marks, and video completion reports delivered to parents." },
              { icon: Heart, title: "Affordable Learning", desc: "Reasonable first-class fees, flexible monthly payments, no hidden charges." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800">
                <f.icon className="text-teal mb-3" size={28} />
                <h3 className="font-bold text-navy dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-4">What We Offer</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Grade 1–13 school subjects",
                "O/L and A/L complete courses",
                "Grade 5 Scholarship preparation",
                "Government exam classes (Grama Sevaka, Police)",
                "Skill and language courses",
                "Live classes via Zoom",
                "Recorded classes for missed sessions",
                "Full LMS — notes, past papers, quizzes",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-teal rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}