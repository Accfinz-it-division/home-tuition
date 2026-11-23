"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900">
      <section className="bg-navy py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-300">We'd love to hear from you. Reach out anytime.</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 rounded-2xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800">
              <Mail className="text-teal flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-navy dark:text-white mb-1">Email</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">info@hometuition.lk</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">support@hometuition.lk</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800">
              <Phone className="text-teal flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-navy dark:text-white mb-1">Phone</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">+94 7X XXX XXXX</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800">
              <MapPin className="text-teal flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-navy dark:text-white mb-1">Address</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Colombo, Sri Lanka</p>
              </div>
            </div>

            <a
              href="https://wa.me/947XXXXXXXX"
              className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition"
            >
              <MessageCircle size={20} /> Chat on WhatsApp
            </a>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-navy-700 p-6 bg-white dark:bg-navy-800">
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-4">Send a Message</h2>

            {submitted ? (
              <div className="p-6 bg-teal/10 border border-teal rounded-xl text-center">
                <p className="text-teal font-semibold">✅ Message sent successfully!</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <input
                  name="name"
                  placeholder="Your Name"
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-teal text-white font-semibold py-3 rounded-lg hover:bg-teal-600 transition"
                >
                  <Send size={18} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}