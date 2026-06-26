"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  Briefcase,
  DollarSign,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard/freelancer",
    icon: LayoutDashboard,
  },
  {
    name: "Browse Tasks",
    href: "/tasks",
    icon: Search,
  },
  {
    name: "My Proposals",
    href: "/dashboard/freelancer/my-proposals",
    icon: FileText,
  },
  {
    name: "Active Projects",
    href: "/dashboard/freelancer/active-projects",
    icon: Briefcase,
  },
  {
    name: "My Earnings",
    href: "/dashboard/freelancer/earnings",
    icon: DollarSign,
  },
  {
    name: "Edit Profile",
    href: "/dashboard/freelancer/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/dashboard/freelancer/settings",
    icon: Settings,
  },
];

export default function FreelancerSidebar() {
  const pathname = usePathname();

  return (
    // মূল র‍্যাপার (Width: 270px এবং ব্যাকগ্রাউন্ড সেট করা হয়েছে)
    <aside className="w-[270px] min-h-screen bg-gradient-to-b from-[#0b0b12] to-[#08080c] border-r border-[#16161d] flex flex-col justify-between font-sans antialiased p-4 py-6 box-border relative overflow-hidden">
      {/* হালকা অ্যাম্বিয়েন্ট গ্লো */}
      <div className="pointer-events-none absolute -top-24 -left-20 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px]" />

      <div className="relative z-10">
        {/* Logo Header */}
        <div className="flex items-center gap-3 pl-3 mb-10">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.45)]">
            <span className="w-2 h-2 rounded-full bg-white/90" />
          </div>
          <span className="text-zinc-50 text-[17px] font-bold tracking-wide">
            FreelanceHub
          </span>
        </div>

        {/* Navigation Menu — আইটেমের মধ্যে fixed gap-5 (ছবির মতো মাঝারি স্পেসিং) */}
        <nav className="flex flex-col">
          <ul className="flex flex-col gap-5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between rounded-full px-6 py-4 text-[15px] font-medium transition-all duration-300 group relative box-border border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50
                    ${
                      active
                        ? "bg-purple-500/[0.08] border-purple-400/35 text-white shadow-[0_0_22px_rgba(168,85,247,0.35),0_0_46px_rgba(168,85,247,0.16)]"
                        : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon
                        size={22}
                        strokeWidth={1.8}
                        className={`shrink-0 transition-colors duration-300 ${
                          active ? "text-purple-400" : "text-zinc-500 group-hover:text-zinc-300"
                        }`}
                      />
                      <span className="tracking-wide">{item.name}</span>
                    </div>

                    {/* ডানপাশের পার্পল ডট ইন্ডিকেটর */}
                    {active && (
                      <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)] mr-1 shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Divider & Logout Button */}
      <div className="relative z-10">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#1d1d26] to-transparent my-3 mx-1" />

        <Link
          href="/"
          className="flex items-center gap-4 rounded-full px-6 py-4 text-[15px] font-medium text-zinc-400 hover:bg-red-500/[0.05] hover:text-red-300 transition-all duration-300 box-border group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
        >
          <LogOut
            size={22}
            strokeWidth={1.8}
            className="shrink-0 text-zinc-500 group-hover:text-red-400 transition-colors duration-300"
          />
          <span className="tracking-wide">Logout</span>
        </Link>
      </div>
    </aside>
  );
}