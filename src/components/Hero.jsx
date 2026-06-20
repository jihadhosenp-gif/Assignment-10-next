"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, Plus, CheckCircle2, Zap } from "lucide-react";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const floatY = (yRange = 14, duration = 4) => ({
  y: [0, -yRange, 0],
  transition: { duration, repeat: Infinity, ease: "easeInOut" },
});

const floatYDelay = (yRange = 10, duration = 5, delay = 1.2) => ({
  y: [0, -yRange, 0],
  transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
});

export default function Hero() {
  return (
    <motion.section
      className="relative min-h-screen w-full overflow-hidden bg-[#08080f] flex items-center"
      initial="hidden"
      animate="visible"
    >
      {/* ── Gradient blobs ── */}
      <motion.div
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
        style={{ background: "radial-gradient(circle, #2563eb, transparent 70%)" }}
        animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-10 blur-[90px]"
        style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* ── Grid overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-24 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center min-h-screen lg:min-h-0 lg:py-32">

          {/* ── LEFT ── */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-7">

            {/* Trust badge */}
            <motion.div
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg"
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-white/80 tracking-wide">
                Trusted by 48,000+ founders &amp; freelancers
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-5xl sm:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight text-white"
            >
              Get your tasks done by{" "}
              <span
                className="inline-block"
                style={{
                  background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 45%, #34d399 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "gradientShift 4s ease infinite",
                  backgroundSize: "200% 200%",
                }}
              >
                skilled freelancers
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              custom={2}
              variants={fadeUp}
              className="max-w-md text-base sm:text-lg text-white/50 leading-relaxed"
            >
              Post a micro-task in minutes, compare proposals in hours, and ship work this week. A modern marketplace built for speed and efficiency.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              custom={3}
              variants={fadeUp}
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              {/* Primary */}
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(124,58,237,0.45)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white text-sm sm:text-base"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                }}
              >
                Post a Task
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>

              {/* Secondary */}
              <motion.button
                whileHover={{ backgroundColor: "rgba(255,255,255,0.08)", scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white/80 text-sm sm:text-base border border-white/10 bg-white/5 backdrop-blur-xl"
              >
                Browse Tasks
              </motion.button>
            </motion.div>

            {/* Social proof row */}
            <motion.div custom={4} variants={fadeUp} className="flex items-center gap-3 mt-1">
              <div className="flex -space-x-2">
                {["#7c3aed","#2563eb","#0891b2","#059669"].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#08080f] flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: c }}
                  >
                    {["D","S","M","A"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/40">
                <span className="text-white/70 font-semibold">2,400+</span> tasks posted this week
              </p>
            </motion.div>
          </div>

          {/* ── RIGHT ── */}
          <div className="relative flex items-center justify-center h-[480px] sm:h-[540px]">

            {/* ── Card 1 – New Proposal ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "absolute", top: "0%", right: "0%", width: "260px" }}
              animate={floatYDelay(12, 5, 0)}
              whileHover={{ scale: 1.04, y: -6 }}
            >
              <div
                className="rounded-2xl border border-white/10 p-5 shadow-2xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">New Proposal</p>
                </div>
                <p className="text-white font-bold text-lg mb-1">Daniel R. → $2,400</p>
                <p className="text-white/40 text-sm leading-snug">Can ship in 9 days with weekly demos.</p>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/80 text-white hover:bg-violet-500 transition-colors">
                    Accept
                  </button>
                  <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-white/10 text-white/50 hover:bg-white/5 transition-colors">
                    Decline
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ── Card 2 – Project card ── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "absolute", top: "22%", left: "0%", width: "280px" }}
              animate={floatY(10, 6)}
              whileHover={{ scale: 1.04, y: -6 }}
            >
              <div
                className="rounded-2xl border border-white/10 p-5 shadow-2xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/20">
                    Development
                  </span>
                  <span className="text-[10px] text-white/30 font-medium">12 Days</span>
                </div>
                <p className="text-white font-bold text-base leading-snug mb-3">
                  Build Next.js Dashboard with Charts
                </p>
                <div className="h-px bg-white/5 mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs text-white/40">Fast hire</span>
                  </div>
                  <span className="text-white font-extrabold text-lg">$2,400</span>
                </div>
              </div>
            </motion.div>

            {/* ── Card 3 – Payout ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "absolute", bottom: "4%", right: "8%", width: "230px" }}
              animate={floatYDelay(8, 4.5, 0.6)}
              whileHover={{ scale: 1.04, y: -6 }}
            >
              <div
                className="rounded-2xl border border-emerald-500/20 p-5 shadow-2xl"
                style={{
                  background: "rgba(5, 150, 105, 0.08)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Payout Cleared</p>
                </div>
                <p className="text-emerald-300 font-extrabold text-2xl mb-1">+$1,800</p>
                <p className="text-white/40 text-xs">Bloom Co · TikTok Campaign</p>
              </div>
            </motion.div>

            {/* ── Floating Plus badge ── */}
            <motion.div
              style={{ position: "absolute", top: "50%", right: "2%", transform: "translateY(-50%)" }}
              animate={{ rotate: [0, 15, -15, 0], y: [0, -5, 5, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-lg"
                style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}
              >
                <Plus className="w-5 h-5 text-white/40" />
              </div>
            </motion.div>

            {/* Glow behind cards */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-20 blur-[80px] pointer-events-none"
              style={{ background: "radial-gradient(circle, #6d28d9, transparent 70%)" }}
            />
          </div>
        </div>
      </div>

      {/* Gradient text animation keyframes */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </motion.section>
  );
}