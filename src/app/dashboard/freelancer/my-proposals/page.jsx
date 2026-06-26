"use client";

import { useSession } from "@/lib/auth-client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Eye,
  X,
  RefreshCw,
  LayoutDashboard,
  ListChecks,
  FileText,
  DollarSign,
  User,
  Settings,
  LogOut,
  ArrowUpRight,
  Calendar,
  Tag,
  AlertCircle,
  Inbox,
  Check,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG = {
  pending: {
    label:  "Pending",
    color:  "text-amber-400",
    bg:     "bg-amber-400/10",
    border: "border-amber-400/20",
    dot:    "bg-amber-400",
  },
  accepted: {
    label:  "Accepted",
    color:  "text-emerald-400",
    bg:     "bg-emerald-400/10",
    border: "border-emerald-400/20",
    dot:    "bg-emerald-400",
  },
  rejected: {
    label:  "Rejected",
    color:  "text-red-400",
    bg:     "bg-red-400/10",
    border: "border-red-400/20",
    dot:    "bg-red-400",
  },
};

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",       href: "/dashboard/freelancer" },
  { icon: ListChecks,      label: "Browse Tasks",    href: "/dashboard/freelancer/browse-tasks" },
  { icon: FileText,        label: "My Proposals",    href: "/dashboard/freelancer/proposals", active: true },
  { icon: Briefcase,       label: "Active Projects", href: "/dashboard/freelancer/projects" },
  { icon: DollarSign,      label: "My Earnings",     href: "/dashboard/freelancer/earnings" },
  { icon: User,            label: "Profile",         href: "/dashboard/freelancer/profile" },
  { icon: Settings,        label: "Settings",        href: "/dashboard/freelancer/settings" },
];

const SORT_OPTIONS = [
  { value: "newest",  label: "Newest First" },
  { value: "oldest",  label: "Oldest First" },
  { value: "highest", label: "Highest Budget" },
  { value: "lowest",  label: "Lowest Budget" },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

const drawerVariants = {
  hidden:  { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 32 } },
  exit:    { x: "100%", opacity: 0, transition: { duration: 0.22, ease: "easeIn" } },
};

function formatBudget(value) {
  const num = Number(value);
  if (isNaN(num) || value === undefined || value === null) return "—";
  return "$" + num.toLocaleString();
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return String(value);
  return d.toISOString().split("T")[0];
}

function getStatusConfig(status) {
  const key = (status || "pending").toLowerCase();
  return STATUS_CONFIG[key] || STATUS_CONFIG.pending;
}

function StatusBadge({ status }) {
  const cfg = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
        ${cfg.color} ${cfg.bg} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, colorClass, gradientFrom, gradientTo, index }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-xl cursor-default"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
    >
      <div
        className="absolute inset-0 opacity-[0.06] rounded-[18px]"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[#9CA3AF] text-xs font-medium tracking-wide uppercase mb-2">{label}</p>
          <p className="text-[#F5F7FA] text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${colorClass} bg-white/[0.07]`}>
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-4 rounded-lg bg-white/[0.06] animate-pulse"
            style={{ width: `${60 + (i % 3) * 20}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

function MobileCard({ proposal, onView, onCopy }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-[18px] border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[#F5F7FA] font-semibold text-sm leading-snug flex-1">
          {proposal.taskTitle}
        </p>
        <StatusBadge status={proposal.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-[#9CA3AF]">
        <span className="flex items-center gap-1">
          <Tag size={11} />
          {proposal.category || "—"}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign size={11} />
          {formatBudget(proposal.proposed_budget)}
        </span>
        <span className="flex items-center gap-1">
          <User size={11} />
          {proposal.client_name || proposal.clientName || "—"}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {formatDate(proposal.createdAt)}
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onView(proposal)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[#7C6BF8] bg-[#7C6BF8]/10 border border-[#7C6BF8]/20 rounded-xl py-2 hover:bg-[#7C6BF8]/20 transition-colors"
        >
          <Eye size={12} /> View
        </button>
        <button
          onClick={() => onCopy(proposal._id)}
          className="flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF] bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 hover:text-[#F5F7FA] transition-colors"
        >
          <Copy size={12} />
        </button>
      </div>
    </motion.div>
  );
}

function Drawer({ proposal, onClose }) {
  if (!proposal) return null;

  return (
    <motion.div
      key="drawer"
      variants={drawerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col border-l border-white/[0.08] bg-[#111114]/95 backdrop-blur-2xl shadow-2xl"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
        <div>
          <p className="text-[10px] text-[#7C6BF8] font-semibold tracking-widest uppercase mb-1">
            Proposal Details
          </p>
          <h2 className="text-[#F5F7FA] font-bold text-lg leading-tight">
            {proposal.taskTitle}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-white/[0.08] transition-all"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div className="flex items-center justify-between">
          <StatusBadge status={proposal.status} />
          <span className="text-xs text-[#9CA3AF]">
            Submitted {formatDate(proposal.createdAt)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Category",     value: proposal.category || "—",                                          icon: Tag },
            { label: "Budget Bid",   value: formatBudget(proposal.proposed_budget),                            icon: DollarSign },
            { label: "Est. Delivery",value: proposal.estimated_days ? `${proposal.estimated_days} days` : "—", icon: Clock },
            { label: "Deadline",     value: proposal.deadline ? formatDate(proposal.deadline) : "—",           icon: Calendar },
            { label: "Client",       value: proposal.client_name || proposal.clientName || "—",                icon: User },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
              <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Icon size={10} /> {label}
              </p>
              <p className="text-[#F5F7FA] text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>

        {proposal.cover_note && (
          <div className="rounded-xl border border-[#7C6BF8]/20 bg-[#7C6BF8]/[0.05] p-4">
            <p className="text-[10px] text-[#7C6BF8] uppercase tracking-wider mb-2 font-semibold">
              Your Cover Letter
            </p>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">{proposal.cover_note}</p>
          </div>
        )}

        {proposal.description && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-2">
              Task Description
            </p>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">{proposal.description}</p>
          </div>
        )}

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#7C6BF8]/20 flex items-center justify-center">
            <User size={14} className="text-[#7C6BF8]" />
          </div>
          <div>
            <p className="text-[#F5F7FA] text-sm font-medium">
              {proposal.freelancer_name || "You"}
            </p>
            <p className="text-[10px] text-[#9CA3AF]">{proposal.freelancer_email}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/[0.08] flex gap-3">
        <a
          href={`/dashboard/freelancer/browse-tasks/${proposal.taskId}`}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-white bg-[#7C6BF8] hover:bg-[#6C5CE7] rounded-xl py-2.5 transition-colors"
        >
          <ExternalLink size={14} /> View Task
        </a>
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-2 text-sm text-[#9CA3AF] border border-white/[0.08] rounded-xl px-4 py-2.5 hover:text-[#F5F7FA] hover:bg-white/[0.05] transition-all"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}

export default function MyProposalsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const freelancerEmail = session?.user?.email;

  const [proposals, setProposals]               = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [search, setSearch]                     = useState("");
  const [statusFilter, setStatusFilter]         = useState("All");
  const [categoryFilter, setCategoryFilter]     = useState("All");
  const [sort, setSort]                         = useState("newest");
  const [page, setPage]                         = useState(1);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [copiedId, setCopiedId]                 = useState(null);

  const fetchProposals = useCallback(async () => {
    if (!freelancerEmail) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/proposals/freelancer/${freelancerEmail}`
      );
      setProposals(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load proposals.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [freelancerEmail]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const categories = [
    "All",
    ...Array.from(new Set(proposals.map((p) => p.category).filter(Boolean))),
  ];

  const stats = {
    total:    proposals.length,
    pending:  proposals.filter((p) => p.status === "pending").length,
    accepted: proposals.filter((p) => p.status === "accepted").length,
    rejected: proposals.filter((p) => p.status === "rejected").length,
  };

  const filtered = proposals
    .filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.taskTitle?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.freelancer_name?.toLowerCase().includes(q) ||
        p.client_name?.toLowerCase().includes(q);
      const matchStatus   = statusFilter === "All" || p.status === statusFilter.toLowerCase();
      const matchCat      = categoryFilter === "All" || p.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    })
    .sort((a, b) => {
      if (sort === "newest")  return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest")  return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "highest") return Number(b.proposed_budget) - Number(a.proposed_budget);
      return Number(a.proposed_budget) - Number(b.proposed_budget);
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCopy = (id) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/dashboard/freelancer/browse-tasks/${id}`
    );
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setSort("newest");
    setPage(1);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F] text-[#9CA3AF] text-sm">
        Loading session…
      </div>
    );
  }

  if (!freelancerEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F] text-[#9CA3AF] text-sm">
        Please log in to view your proposals.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0B0B0F] text-[#F5F7FA]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
              My Proposals
            </h1>
            <p className="text-[#9CA3AF] text-sm mt-0.5">
              View and manage all the proposals you have submitted to clients.
            </p>
          </div>
          <a
            href="/dashboard/freelancer/browse-tasks"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#7C6BF8] hover:bg-[#6C5CE7] px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#7C6BF8]/20 whitespace-nowrap self-start sm:self-auto"
          >
            Browse Tasks <ArrowUpRight size={15} />
          </a>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard index={0} icon={Briefcase}    label="Total Proposals" value={loading ? "—" : stats.total}    colorClass="text-[#A78BFA]"  gradientFrom="#7C6BF8" gradientTo="#A78BFA" />
          <StatCard index={1} icon={Clock}        label="Pending"         value={loading ? "—" : stats.pending}  colorClass="text-amber-400"  gradientFrom="#FBBF24" gradientTo="#F59E0B" />
          <StatCard index={2} icon={CheckCircle2} label="Accepted"        value={loading ? "—" : stats.accepted} colorClass="text-emerald-400" gradientFrom="#34D399" gradientTo="#10B981" />
          <StatCard index={3} icon={XCircle}      label="Rejected"        value={loading ? "—" : stats.rejected} colorClass="text-red-400"    gradientFrom="#EF4444" gradientTo="#DC2626" />
        </div>

        <motion.div
          variants={fadeUp}
          custom={4}
          initial="hidden"
          animate="visible"
          className="rounded-[18px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search by task title, category, or client…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#F5F7FA] placeholder-[#9CA3AF] text-sm focus:outline-none focus:border-[#7C6BF8]/50 focus:bg-white/[0.07] transition-all"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#F5F7FA] text-sm focus:outline-none focus:border-[#7C6BF8]/50 transition-all"
            >
              {["All", "Pending", "Accepted", "Rejected"].map((s) => (
                <option key={s} value={s} className="bg-[#111114]">{s}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#F5F7FA] text-sm focus:outline-none focus:border-[#7C6BF8]/50 transition-all"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#111114]">{c}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#F5F7FA] text-sm focus:outline-none focus:border-[#7C6BF8]/50 transition-all"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#111114]">{o.label}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#F5F7FA] border border-white/[0.08] px-4 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all whitespace-nowrap"
            >
              <SlidersHorizontal size={14} /> Reset
            </button>
          </div>

          {!loading && filtered.length !== proposals.length && (
            <p className="text-xs text-[#9CA3AF]">
              Showing {filtered.length} of {proposals.length} proposals
            </p>
          )}
        </motion.div>

        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible">
          {error ? (
            <div className="rounded-[18px] border border-red-400/20 bg-red-400/[0.05] p-8 flex flex-col items-center gap-4 text-center">
              <AlertCircle size={36} className="text-red-400" />
              <div>
                <p className="text-[#F5F7FA] font-semibold">{error}</p>
                <p className="text-[#9CA3AF] text-sm mt-1">Check your connection and try again.</p>
              </div>
              <button
                onClick={fetchProposals}
                className="flex items-center gap-2 text-sm font-medium text-white bg-red-500/80 hover:bg-red-500 px-5 py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>

          ) : !loading && filtered.length === 0 ? (
            <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.03] p-12 flex flex-col items-center gap-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#7C6BF8]/10 border border-[#7C6BF8]/20 flex items-center justify-center">
                <Inbox size={28} className="text-[#7C6BF8]" />
              </div>
              <div>
                <p className="text-[#F5F7FA] font-bold text-lg">No Proposals Found</p>
                <p className="text-[#9CA3AF] text-sm mt-1">
                  {search || statusFilter !== "All" || categoryFilter !== "All"
                    ? "Try adjusting your filters."
                    : "You haven't submitted any proposals yet."}
                </p>
              </div>
              <a
                href="/dashboard/freelancer/browse-tasks"
                className="flex items-center gap-2 text-sm font-semibold text-white bg-[#7C6BF8] hover:bg-[#6C5CE7] px-6 py-2.5 rounded-xl transition-all"
              >
                Browse Tasks <ArrowUpRight size={14} />
              </a>
            </div>

          ) : (
            <>
              <div className="hidden md:block rounded-[18px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.07]">
                        {["Task Title", "Category", "Budget Bid", "Est. Days", "Submitted", "Status", "Actions"].map((col) => (
                          <th
                            key={col}
                            className="px-4 py-3.5 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {loading
                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                        : paginated.map((p) => (
                            <motion.tr
                              key={p._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="group hover:bg-white/[0.03] transition-colors cursor-pointer"
                              onClick={() => setSelectedProposal(p)}
                            >
                              <td className="px-4 py-3.5">
                                <p className="text-[#F5F7FA] text-sm font-medium max-w-[200px] truncate group-hover:text-[#A78BFA] transition-colors">
                                  {p.taskTitle}
                                </p>
                              </td>
                              <td className="px-4 py-3.5">
                                {p.category ? (
                                  <span className="text-xs text-[#9CA3AF] bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 rounded-lg">
                                    {p.category}
                                  </span>
                                ) : (
                                  <span className="text-xs text-[#9CA3AF]/40">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-[#F5F7FA] text-sm font-semibold">
                                {formatBudget(p.proposed_budget)}
                              </td>
                              <td className="px-4 py-3.5 text-[#9CA3AF] text-sm">
                                {p.estimated_days ? `${p.estimated_days}d` : "—"}
                              </td>
                              <td className="px-4 py-3.5 text-[#9CA3AF] text-sm">
                                {formatDate(p.createdAt)}
                              </td>
                              <td className="px-4 py-3.5">
                                <StatusBadge status={p.status} />
                              </td>
                              <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedProposal(p)}
                                    title="View details"
                                    className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#7C6BF8] hover:bg-[#7C6BF8]/10 transition-all"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <a
                                    href={`/dashboard/freelancer/browse-tasks/${p.taskId}`}
                                    title="View task"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-white/[0.07] transition-all"
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                  <button
                                    onClick={() => handleCopy(p.taskId)}
                                    title="Copy task link"
                                    className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
                                  >
                                    {copiedId === p.taskId
                                      ? <Check size={14} className="text-emerald-400" />
                                      : <Copy size={14} />}
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="md:hidden space-y-3">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-[18px] border border-white/[0.08] bg-white/[0.04] p-4 space-y-3 animate-pulse">
                        <div className="h-4 bg-white/[0.06] rounded-lg w-3/4" />
                        <div className="grid grid-cols-2 gap-2">
                          {Array.from({ length: 4 }).map((_, j) => (
                            <div key={j} className="h-3 bg-white/[0.05] rounded" />
                          ))}
                        </div>
                      </div>
                    ))
                  : paginated.map((p) => (
                      <MobileCard
                        key={p._id}
                        proposal={p}
                        onView={setSelectedProposal}
                        onCopy={() => handleCopy(p.taskId)}
                      />
                    ))}
              </div>

              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-[#9CA3AF]">
                    Page {page} of {totalPages} · {filtered.length} proposals
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-xl border border-white/[0.08] text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                      const num   = start + i;
                      if (num > totalPages) return null;
                      return (
                        <button
                          key={num}
                          onClick={() => setPage(num)}
                          className={`w-8 h-8 rounded-xl text-xs font-medium transition-all
                            ${num === page
                              ? "bg-[#7C6BF8] text-white shadow-lg shadow-[#7C6BF8]/25"
                              : "text-[#9CA3AF] border border-white/[0.08] hover:text-[#F5F7FA] hover:bg-white/[0.06]"
                            }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-xl border border-white/[0.08] text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

      </div>

      <AnimatePresence>
        {selectedProposal && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProposal(null)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <Drawer
              proposal={selectedProposal}
              onClose={() => setSelectedProposal(null)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}