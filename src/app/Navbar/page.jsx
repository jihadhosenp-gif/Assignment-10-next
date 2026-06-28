"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Menu,
  Briefcase,
  Users,
  Home,
  LayoutDashboard,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

// ─── Animation ────────────────────────────────────────────────────────────────
const navVariants = {
  hidden: { y: -80, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Glass styles ─────────────────────────────────────────────────────────────
const glassStrong = {
  background: "rgba(8,8,15,0.85)",
  backdropFilter: "blur(32px)",
  WebkitBackdropFilter: "blur(32px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const glass = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  admin: {
    href: "/dashboard/admin",
    label: "Admin",
    icon: ShieldCheck,
    badgeBg: "rgba(239,68,68,0.25)",
    badgeColor: "#fca5a5",
  },
  freelancer: {
    href: "/dashboard/freelancer",
    label: "Freelancer",
    icon: Briefcase,
    badgeBg: "rgba(124,58,237,0.25)",
    badgeColor: "#c4b5fd",
  },
  client: {
    href: "/dashboard/client",
    label: "Client",
    icon: UserCircle,
    badgeBg: "rgba(37,99,235,0.25)",
    badgeColor: "#93c5fd",
  },
};

function getDashboardHref(role) {
  if (!role) return "/dashboard";
  return ROLE_CONFIG[role.toLowerCase()]?.href ?? "/dashboard";
}

// ─── Public nav links ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Home",         icon: Home,      href: "/" },
  { label: "Browse Tasks", icon: Briefcase, href: "/tasks" },
  { label: "Freelancers",  icon: Users,     href: "/freelancers" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb,#06b6d4)" }}
      >
        <span className="text-white font-bold">S</span>
      </div>
      <div>
        <h2 className="text-white font-bold text-lg">SkillSwap</h2>
        <p className="text-white/40 text-xs">Freelance Platform</p>
      </div>
    </Link>
  );
}

function NavLink({ icon: Icon, label, href, isActive }) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2 transition ${
        isActive ? "text-white" : "text-white/60 hover:text-white"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
      {isActive && (
        <motion.span
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
        />
      )}
    </Link>
  );
}

function DashboardLink({ role }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/dashboard");
  const config = role ? ROLE_CONFIG[role.toLowerCase()] : null;
  const href = config?.href ?? "/dashboard";
  const Icon = config?.icon ?? LayoutDashboard;

  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2 transition ${
        isActive ? "text-white" : "text-white/60 hover:text-white"
      }`}
    >
      <Icon size={16} />
      <span>Dashboard</span>
      {isActive && (
        <motion.span
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
        />
      )}
    </Link>
  );
}

function SearchBar() {
  return (
    <div
      className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full"
      style={glass}
    >
      <Search size={16} className="text-white/40" />
      <input
        type="text"
        placeholder="Search..."
        className="bg-transparent outline-none text-sm text-white placeholder:text-white/30 w-32 focus:w-48 transition-all duration-300"
      />
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  const userRole = session?.user?.role;
  const roleConfig = userRole ? ROLE_CONFIG[userRole.toLowerCase()] : null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="h-24" />

      <motion.header
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
      >
        <motion.nav
          className="w-full max-w-7xl flex items-center justify-between px-6 py-4 rounded-2xl"
          style={{
            ...glassStrong,
            boxShadow: scrolled
              ? "0 10px 40px rgba(0,0,0,.5)"
              : "0 4px 20px rgba(0,0,0,.3)",
          }}
        >
          {/* Logo */}
          <Logo />

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                {...item}
                isActive={
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                }
              />
            ))}

            {/* Dashboard — শুধু logged-in ইউজারের জন্য */}
            {!isPending && session?.user && (
              <DashboardLink role={userRole} />
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <SearchBar />

            {!isPending && (
              <>
                {session?.user ? (
                  <>
                    {/* Profile chip */}
                    <Link
                      href="/profile"
                      className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                    >
                      <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                        {session.user.name?.charAt(0)}
                      </div>
                      <span>{session.user.name}</span>

                      {/* Role badge */}
                      {roleConfig && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                          style={{
                            background: roleConfig.badgeBg,
                            color: roleConfig.badgeColor,
                          }}
                        >
                          {roleConfig.label}
                        </span>
                      )}
                    </Link>

                    {/* Sign Out */}
                    <button
                      onClick={() => signOut()}
                      className="px-5 py-2 rounded-full text-white font-semibold transition hover:opacity-90 active:scale-95"
                      style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="hidden md:block px-4 py-2 rounded-full text-white/70 hover:text-white transition"
                    >
                      Login
                    </Link>

                    <Link href="/signUp">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-5 py-2 rounded-full text-white font-semibold cursor-pointer"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}
                      >
                        Get Started
                      </motion.div>
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Mobile Menu */}
            <button
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center"
              style={glass}
            >
              <Menu className="text-white" size={18} />
            </button>
          </div>
        </motion.nav>
      </motion.header>
    </>
  );
}