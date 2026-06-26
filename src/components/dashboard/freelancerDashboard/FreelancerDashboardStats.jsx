"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── MOCK DATA — পরে এখানে আপনার API call বসাবেন ───
const mockStats = {
  totalProposals: 5,
  totalProposalsChange: "+18%",
  totalProposalsChart: [{ v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: 3 }, { v: 4 }, { v: 5 }],
  pendingProposals: 1,
  pendingProposalsChart: [{ v: 3 }, { v: 5 }, { v: 4 }, { v: 6 }, { v: 5 }, { v: 7 }, { v: 6 }],
  acceptedProposals: 3,
  acceptanceRate: 60,
  acceptedProposalsChart: [{ v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }, { v: 6 }],
  totalEarnings: 19750,
  earningsChange: "+24% vs last month",
  earningsChart: [{ v: 4000 }, { v: 6000 }, { v: 8000 }, { v: 10000 }, { v: 14000 }, { v: 19750 }],
  earningsYoY: "+32%",
};

const mockEarnings = [
  { month: "Jan", amount: 1200 },
  { month: "Feb", amount: 1800 },
  { month: "Mar", amount: 2200 },
  { month: "Apr", amount: 1600 },
  { month: "May", amount: 3100 },
  { month: "Jun", amount: 2800 },
  { month: "Jul", amount: 3900 },
  { month: "Aug", amount: 4200 },
  { month: "Sep", amount: 3600 },
  { month: "Oct", amount: 5100 },
  { month: "Nov", amount: 4800 },
  { month: "Dec", amount: 5750 },
];

const mockProjects = [
  { title: "Stripe Subscription Integration", clientName: "Linewave", progress: 65, amount: 1400 },
  { title: "E-commerce Dashboard UI", clientName: "ShopBase", progress: 40, amount: 2200 },
  { title: "REST API Development", clientName: "TechCorp", progress: 85, amount: 3500 },
];

// ─── Custom Tooltip ───────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={s.tooltip}>
        <p style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>{label}</p>
        <p style={{ color: "#fff", fontWeight: 700 }}>${payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
}

// ─── Stat Card ────────────────────────────────────────
function StatCard({ icon, iconBg, label, value, badge, badgeColor, chartData, chartColor, chartType }) {
  return (
    <div style={s.card}>
      <div style={s.cardTop}>
        <div style={{ ...s.iconWrap, background: iconBg }}>{icon}</div>
        <span style={{ ...s.badge, color: badgeColor }}>{badge}</span>
      </div>
      <p style={s.cardLabel}>{label}</p>
      <p style={s.cardValue}>{value}</p>
      <div style={{ height: 64, marginTop: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={chartData} barSize={7}>
              <Bar dataKey="v" fill={chartColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad_${chartColor.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#grad_${chartColor.replace("#", "")})`}
                dot={false}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────
function ProjectCard({ title, clientName, progress, amount }) {
  return (
    <div style={s.projectCard}>
      <div style={s.projectRow}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={s.projectName}>{title}</p>
          <p style={s.projectClient}>{clientName}</p>
        </div>
        <span style={s.statusBadge}>
          <span style={s.statusDot} />
          In Progress
        </span>
      </div>
      <div style={s.projectMeta}>
        <span style={{ color: "#888", fontSize: 13 }}>{progress}% complete</span>
        <span style={{ color: "#ccc", fontSize: 13, fontWeight: 600 }}>${amount?.toLocaleString()}</span>
      </div>
      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${progress}%` }} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────
export default function FreelancerDashboard() {
  const stats = mockStats;
  const earnings = mockEarnings;
  const projects = mockProjects;

  const statCards = [
    {
      icon: <FileIcon />, iconBg: "#4c1d95",
      label: "TOTAL PROPOSALS", value: stats.totalProposals,
      badge: stats.totalProposalsChange, badgeColor: "#a78bfa",
      chartData: stats.totalProposalsChart, chartColor: "#8b5cf6", chartType: "area",
    },
    {
      icon: <ClockIcon />, iconBg: "#92400e",
      label: "PENDING PROPOSALS", value: stats.pendingProposals,
      badge: "Awaiting review", badgeColor: "#fbbf24",
      chartData: stats.pendingProposalsChart, chartColor: "#f59e0b", chartType: "bar",
    },
    {
      icon: <CheckIcon />, iconBg: "#065f46",
      label: "ACCEPTED PROPOSALS", value: stats.acceptedProposals,
      badge: `${stats.acceptanceRate}% acceptance rate`, badgeColor: "#34d399",
      chartData: stats.acceptedProposalsChart, chartColor: "#10b981", chartType: "bar",
    },
    {
      icon: <DollarIcon />, iconBg: "#0c4a6e",
      label: "TOTAL EARNINGS", value: `$${stats.totalEarnings?.toLocaleString()}`,
      badge: stats.earningsChange, badgeColor: "#38bdf8",
      chartData: stats.earningsChart, chartColor: "#06b6d4", chartType: "area",
    },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 1100px) {
          .grid4 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .grid4 { grid-template-columns: 1fr !important; }
          .grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={s.page}>

        {/* ── Header ── */}
        <div style={s.header}>
          <div>
            <h1 style={s.heading}>Welcome back 👋</h1>
            <p style={s.subheading}>Here's what's happening with your freelance work today.</p>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid4" style={s.grid4}>
          {statCards.map((c, i) => <StatCard key={i} {...c} />)}
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid2" style={s.grid2}>

          {/* Earnings Overview */}
          <div style={s.bigCard}>
            <div style={s.bigCardHeader}>
              <div>
                <p style={s.bigCardTitle}>Earnings overview</p>
                <p style={s.bigCardSub}>Your monthly income trend</p>
              </div>
              <span style={s.yoyBadge}>↗ {stats.earningsYoY} YoY</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={earnings} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#earningsGrad)" dot={false} activeDot={{ r: 5, fill: "#8b5cf6" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Active Projects */}
          <div style={s.bigCard}>
            <div style={s.bigCardHeader}>
              <div>
                <p style={s.bigCardTitle}>Active projects</p>
                <p style={s.bigCardSub}>In progress right now</p>
              </div>
              <button style={s.viewAll}>View all</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {projects.map((p, i) => <ProjectCard key={i} {...p} />)}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Icons ────────────────────────────────────────────
function FileIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}
function DollarIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────
const s = {
  page: {
    padding: "32px",
    backgroundColor: "#0d0f17",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "700",
  },
  subheading: {
    color: "#666",
    fontSize: "14px",
    marginTop: "6px",
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  card: {
    backgroundColor: "#13151f",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    border: "1px solid #1e2130",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    fontSize: "12px",
    fontWeight: "600",
  },
  cardLabel: {
    color: "#555",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginTop: "4px",
  },
  cardValue: {
    color: "#ffffff",
    fontSize: "38px",
    fontWeight: "800",
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  bigCard: {
    backgroundColor: "#13151f",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #1e2130",
  },
  bigCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  bigCardTitle: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "700",
  },
  bigCardSub: {
    color: "#555",
    fontSize: "13px",
    marginTop: "4px",
  },
  yoyBadge: {
    color: "#34d399",
    fontSize: "14px",
    fontWeight: "600",
  },
  viewAll: {
    background: "none",
    border: "none",
    color: "#8b5cf6",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "600",
    padding: 0,
  },
  tooltip: {
    backgroundColor: "#1a1d27",
    border: "1px solid #2a2d3a",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  projectCard: {
    backgroundColor: "#1a1d27",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    border: "1px solid #22253a",
  },
  projectRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  projectName: {
    color: "#e2e4ed",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  projectClient: {
    color: "#555",
    fontSize: "12px",
    marginTop: "3px",
  },
  statusBadge: {
    backgroundColor: "#0d2e2e",
    color: "#34d399",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#34d399",
  },
  projectMeta: {
    display: "flex",
    justifyContent: "space-between",
  },
  progressBar: {
    height: "5px",
    backgroundColor: "#2a2d3a",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #6d28d9, #8b5cf6)",
    borderRadius: "4px",
  },
};