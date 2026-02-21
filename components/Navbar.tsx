"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Chatbot", href: "/pages/chatbot" },
  { label: "Goals", href: "/pages/goals" },
  { label: "Profile", href: "/pages/profile" },
  { label: "Schemes", href: "/pages/schemes" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed z-50 top-0 w-full bg-white/10 backdrop-blur-md h-16  border-b-2 border-blue-300">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-blue-700">
          AULA
        </Link>

        <ul className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-700 text-white"
                    : "text-blue-800 hover:bg-blue-50 hover:text-blue-900"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center rounded-md p-2 text-blue-800 hover:bg-blue-50 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6L18 18M6 18L18 6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-blue-100 bg-white md:hidden">
          <ul className="space-y-1 px-4 py-3 sm:px-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-700 text-white"
                      : "text-blue-800 hover:bg-blue-50 hover:text-blue-900"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
