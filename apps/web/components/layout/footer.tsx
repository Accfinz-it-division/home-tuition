import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="text-teal" size={28} />
              <span className="text-xl font-bold">Home Tuition</span>
            </div>
            <p className="text-sm text-gray-300">
              Sri Lanka's trusted online tuition platform. Live classes, LMS, and parent monitoring.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/courses" className="hover:text-teal">Courses</Link></li>
              <li><Link href="/teachers" className="hover:text-teal">Teachers</Link></li>
              <li><Link href="/about" className="hover:text-teal">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-teal">FAQ</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-gold">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Grade 1–13</li>
              <li>O/L & A/L</li>
              <li>Government Exams</li>
              <li>Skill & Language Courses</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-gold">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><Mail size={14} /> info@hometuition.lk</li>
              <li className="flex items-center gap-2"><Phone size={14} /> +94 7X XXX XXXX</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> Colombo, Sri Lanka</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-navy-400 text-center text-sm text-gray-400">
          © 2026 Home Tuition. All rights reserved.
        </div>
      </div>
    </footer>
  );
  
}