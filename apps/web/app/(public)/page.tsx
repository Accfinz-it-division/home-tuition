import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Video,
  Users,
  BookOpen,
  Award,
  Bell,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy via-navy-700 to-navy-900 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="inline-block bg-teal/20 text-teal-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            🇱🇰 Sri Lanka's Trusted Online Tuition
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Learn From Home.<br />
            <span className="text-gold">Grow With Confidence.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
            Live online classes for Grade 1–13, O/L, A/L, Government Exams, and Skill Courses.
            With parent monitoring and recorded classes you never miss a lesson.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="gold" className="text-lg px-8 py-3">
                Get Started Free
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-navy">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Features */}
      <section className="py-20 px-4 bg-white dark:bg-navy-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy dark:text-white mb-4">
              Why Choose Home Tuition?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We solve the trust problem of online tuition with verified teachers, recorded classes, and transparent parent tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Admin-Verified Teachers", desc: "Every teacher is verified by our admin team before teaching." },
              { icon: Video, title: "Recorded Classes", desc: "Missed a class? Get the full recording delivered to you." },
              { icon: Users, title: "Parent Monitoring", desc: "Live attendance, exam marks, and video completion alerts." },
              { icon: BookOpen, title: "Complete LMS", desc: "Notes, past papers, model papers, quizzes, syllabus, all in one place." },
              { icon: Award, title: "Monthly Exams", desc: "Regular exams with marks delivered to parents." },
              { icon: Bell, title: "WhatsApp & Email Alerts", desc: "Get notified instantly on WhatsApp and email for every event." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-200 dark:border-navy-700 hover:border-teal transition-colors bg-navy-50/50 dark:bg-navy-800">
                <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="text-teal" size={24} />
                </div>
                <h3 className="font-bold text-navy dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-navy-50 dark:bg-navy-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy dark:text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of Sri Lankan students learning from the best teachers — from the comfort of home.
          </p>
          <Link href="/register">
            <Button variant="primary" className="text-lg px-10 py-3">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}