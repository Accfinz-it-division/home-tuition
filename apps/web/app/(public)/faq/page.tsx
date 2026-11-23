import { MessageCircle } from "lucide-react";

const faqs = [
  { q: "How do I register?", a: "Click 'Register' in the navbar. Students under 18 need a parent NIC. Students 18+ only need their own NIC." },
  { q: "How does payment work?", a: "Pay via our payment gateway after enrolling. Only paid students get access to Zoom links and LMS materials." },
  { q: "What if I miss a class?", a: "Don't worry — the full recorded video will be sent to you. You can watch it anytime." },
  { q: "How do parents track their child?", a: "Parents get automatic email and WhatsApp alerts for attendance, exam marks, video completion, and monthly meetings." },
  { q: "Is the first class fee reasonable?", a: "Yes! First class fee is deliberately lower so you can experience the quality before committing to regular fees." },
  { q: "Are teachers verified?", a: "Every teacher is admin-verified before teaching on our platform. We check qualifications and background." },
  { q: "What is included in the LMS?", a: "Notes, past papers, model papers, quizzes, updated syllabus books, and teacher's guides — all for paid students only." },
  { q: "Do you conduct exams?", a: "Yes, monthly exams with marks delivered to parents. Plus attendance calendar and monthly parent meetings." },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-navy-900">
      <section className="bg-navy py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-300">Everything you need to know about Home Tuition</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="rounded-2xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 group"
            >
              <summary className="font-bold text-navy dark:text-white cursor-pointer flex items-center justify-between">
                <span>{faq.q}</span>
                <span className="text-teal group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-300">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-12 text-center p-8 rounded-2xl bg-navy-50 dark:bg-navy-800">
          <MessageCircle className="mx-auto text-teal mb-3" size={40} />
          <h3 className="text-xl font-bold text-navy dark:text-white mb-2">Still have questions?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Our team is here to help you</p>
          <a
            href="https://wa.me/947XXXXXXXX"
            className="inline-block bg-teal text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-600 transition"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}