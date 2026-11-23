"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

// Navigation links for public pages
const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/teachers", label: "Teachers" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-navy-900/90 backdrop-blur border-b border-gray-200 dark:border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="text-teal" size={28} />
            <span className="text-xl font-bold text-navy dark:text-white">
              Home Tuition
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-navy dark:text-gray-200 hover:text-teal transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" className="text-sm py-2 px-4">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" className="text-sm py-2 px-4">
                Register
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-navy dark:text-white"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {open && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-navy-700">
            <div className="flex flex-col gap-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-navy dark:text-gray-200 hover:text-teal px-2 py-1"
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-navy-700">
                <ThemeToggle />
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full text-sm py-2">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button variant="primary" className="w-full text-sm py-2">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}