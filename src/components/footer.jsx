"use client";

import Link from "next/link";
import {
  HomeIcon,
  BriefcaseIcon,
  UsersIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

import { FaGithub, FaLinkedin } from "react-icons/fa";

function XIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={props.className}
    >
      <path d="M18.244 2H21l-6.58 7.5L22 22h-6.8l-5.3-6.6L3.6 22H1l7.1-8.1L2 2h6.9l4.8 6.1L18.244 2zm-1.2 18h1.8L8.2 4H6.3l10.744 16z" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#050816] border-t border-white/10 mt-20 text-white">
      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* LOGO */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500">
                <span className="font-bold text-white">S</span>
              </div>

              <h2 className="text-xl font-bold">SkillSwap</h2>
            </Link>

            <p className="text-white/50 mt-4 text-sm leading-relaxed">
              A modern freelance platform where skills meet opportunities.
              Build, learn, and earn together.
            </p>
          </div>

          {/* NAVIGATION */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>

            <div className="flex flex-col gap-3 text-white/60">

              <Link href="/" className="flex items-center gap-2 hover:text-white transition">
                <HomeIcon className="w-4 h-4" /> Home
              </Link>

              <Link href="/tasks" className="flex items-center gap-2 hover:text-white transition">
                <BriefcaseIcon className="w-4 h-4" /> Tasks
              </Link>

              <Link href="/freelancers" className="flex items-center gap-2 hover:text-white transition">
                <UsersIcon className="w-4 h-4" /> Freelancers
              </Link>

            </div>
          </div>

          {/* CONTACT + SOCIAL */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>

            <p className="flex items-center gap-2 text-white/60">
              <EnvelopeIcon className="w-4 h-4" />
              support@skillswap.com
            </p>

            {/* SOCIAL ICONS */}
            <div className="flex gap-4 mt-6">

              {/* X */}
              <a
                href="#"
                className="group w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <XIcon className="w-5 h-5 group-hover:scale-110 transition" />
              </a>

              {/* GitHub */}
              <a
                href="#"
                className="group w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <FaGithub className="group-hover:scale-110 transition" />
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                className="group w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <FaLinkedin className="group-hover:scale-110 transition" />
              </a>

            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-white/50 text-sm">

          <p>© {year} SkillSwap. All rights reserved.</p>

          <p className="mt-3 md:mt-0">
            Built with Next.js ⚡
          </p>

        </div>
      </div>
    </footer>
  );
}