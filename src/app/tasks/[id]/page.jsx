"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import axios from "axios";
import { useRouter } from "next/navigation";

// ─── Constants ───────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const categoryColors = {
  Design:      { bg: "#2D2B52", text: "#A79EFC", dot: "#7C6BF8" },
  Writing:     { bg: "#0D2B20", text: "#34D399", dot: "#10B981" },
  Development: { bg: "#2A1800", text: "#FBBF24", dot: "#F59E0B" },
  Marketing:   { bg: "#2A0D2E", text: "#E879F9", dot: "#C026D3" },
  Other:       { bg: "#1A1D27", text: "#7B82A0", dot: "#4B5280" },
};

const COLORS = {
  bg:       "#0F1117",
  card:     "#1A1D27",
  card2:    "#22263A",
  border:   "#2A2E42",
  border2:  "#363A52",
  text:     "#E8EAF2",
  muted:    "#7B82A0",
  accent:   "#7C6BF8",
  accent2:  "#9B8CFA",
  green:    "#34D399",
  greenBg:  "#0D2B20",
  yellow:   "#FBBF24",
  yellowBg: "#2A2000",
  red:      "#F87171",
  redBg:    "#2A1010",
};

// ─── Small Reusable Components ────────────────────────────────────────────────

function Badge({ category }) {
  const s = categoryColors[category] || categoryColors["Other"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.text, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {category}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    open:          { label: "Open",        bg: "#0D2B20", color: "#34D399" },
    Open:          { label: "Open",        bg: "#0D2B20", color: "#34D399" },
    "in-progress": { label: "In Progress", bg: "#2A1800", color: "#FBBF24" },
    "In Progress": { label: "In Progress", bg: "#2A1800", color: "#FBBF24" },
    completed:     { label: "Completed",   bg: "#2D2B52", color: "#A79EFC" },
    Completed:     { label: "Completed",   bg: "#2D2B52", color: "#A79EFC" },
  };
  const s = map[status] || map["open"];
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.4px" }}>
      {s.label}
    </span>
  );
}

function Avatar({ name = "U", size = 40 }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Spinner({ size = 14, color = "#fff" }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size, border: `2px solid rgba(255,255,255,0.25)`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
  );
}

function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{ background: COLORS.redBg, border: `1px solid #5A1A1A`, borderRadius: 10, padding: "11px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 13, color: COLORS.red, lineHeight: 1.5 }}>⚠ {message}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16, flexShrink: 0, padding: 0, lineHeight: 1 }}>×</button>
      )}
    </div>
  );
}

// ─── Proposal Form ────────────────────────────────────────────────────────────

function ProposalForm({ task, currentUser, onClose, onSuccess }) {
  const [form, setForm]         = useState({ proposed_budget: "", estimated_days: "", cover_note: "" });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.proposed_budget || isNaN(form.proposed_budget) || Number(form.proposed_budget) <= 0)
      e.proposed_budget = "Enter a valid budget amount (USD)";
    if (!form.estimated_days || isNaN(form.estimated_days) || Number(form.estimated_days) <= 0)
      e.estimated_days = "Enter how many days you need";
    if (!form.cover_note.trim() || form.cover_note.trim().length < 30)
      e.cover_note = "Write at least 30 characters explaining your approach";
    return e;
  };

  const getErrorMessage = (err) => {
    if (!err.response) return "Network error — please check your connection and try again.";
    const status = err.response.status;
    const serverMsg = err.response.data?.message || err.response.data?.error;
    switch (status) {
      case 401: return "You must be logged in to submit a proposal.";
      case 403: return serverMsg || "Only freelancers can submit proposals.";
      case 404: return "This task no longer exists.";
      case 409: return "You have already submitted a proposal for this task.";
      case 422: return serverMsg || "Please check your inputs and try again.";
      case 500: return "Something went wrong on our end. Please try again later.";
      default:  return serverMsg || "An unexpected error occurred. Please try again.";
    }
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setApiError("");

    try {
      await axios.post(
        `${BACKEND_URL}/api/proposals`,
        {
          taskId:          task._id,
          proposed_budget: Number(form.proposed_budget),
          estimated_days:  Number(form.estimated_days),
          cover_note:      form.cover_note.trim(),
          freelancer_email: currentUser?.email,
          freelancer_name:  currentUser?.name,
        },
        { withCredentials: true }
      );
      onSuccess();
    } catch (err) {
      if (err?.response?.status === 409) { onSuccess(); return; }
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasErr) => ({
    width: "100%", padding: "9px 12px",
    border: `1.5px solid ${hasErr ? COLORS.red : COLORS.border2}`,
    borderRadius: 9, fontSize: 14, color: COLORS.text,
    outline: "none", background: "#12141E", boxSizing: "border-box",
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
      <div style={{ background: COLORS.card, borderRadius: 18, width: "100%", maxWidth: 480, padding: "28px 24px", position: "relative", border: `1px solid ${COLORS.border2}` }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: COLORS.card2, border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 18, color: COLORS.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>

        <p style={{ fontSize: 10, fontWeight: 700, color: COLORS.accent2, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 5px" }}>Submit Proposal</p>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: COLORS.text, margin: "0 0 3px", lineHeight: 1.3 }}>{task.title}</h2>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 20px" }}>Client budget: <strong style={{ color: COLORS.text }}>${task.budget}</strong></p>

        <ErrorBanner message={apiError} onDismiss={() => setApiError("")} />

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#9BA4C0", marginBottom: 5 }}>Your bid (USD) *</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.muted, fontWeight: 600, fontSize: 14 }}>$</span>
              <input
                type="number" placeholder="100" value={form.proposed_budget}
                onChange={e => { setForm(f => ({ ...f, proposed_budget: e.target.value })); setErrors(er => ({ ...er, proposed_budget: "" })); }}
                style={{ ...inputStyle(errors.proposed_budget), paddingLeft: 28 }}
                disabled={loading}
              />
            </div>
            {errors.proposed_budget && <p style={{ color: COLORS.red, fontSize: 11, margin: "3px 0 0" }}>⚠ {errors.proposed_budget}</p>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#9BA4C0", marginBottom: 5 }}>Delivery time (days) *</label>
            <input
              type="number" placeholder="5" value={form.estimated_days}
              onChange={e => { setForm(f => ({ ...f, estimated_days: e.target.value })); setErrors(er => ({ ...er, estimated_days: "" })); }}
              style={inputStyle(errors.estimated_days)}
              disabled={loading}
            />
            {errors.estimated_days && <p style={{ color: COLORS.red, fontSize: 11, margin: "3px 0 0" }}>⚠ {errors.estimated_days}</p>}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#9BA4C0", marginBottom: 5 }}>Cover note *</label>
            <textarea
              placeholder="Describe your approach, relevant experience..." value={form.cover_note} rows={4}
              onChange={e => { setForm(f => ({ ...f, cover_note: e.target.value })); setErrors(er => ({ ...er, cover_note: "" })); }}
              style={{ ...inputStyle(errors.cover_note), resize: "vertical", lineHeight: 1.6 }}
              disabled={loading}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
              {errors.cover_note ? <p style={{ color: COLORS.red, fontSize: 11, margin: 0 }}>⚠ {errors.cover_note}</p> : <span />}
              <span style={{ fontSize: 11, color: COLORS.muted }}>{form.cover_note.length} chars</span>
            </div>
          </div>

          <button
            onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: 12, background: loading ? "#4A3FA0" : COLORS.accent, color: "#fff", border: "none", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loading ? <><Spinner /> Submitting...</> : "Submit proposal"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CTA Button (role-aware) ──────────────────────────────────────────────────

function ProposalCTA({ session, sessionLoading, alreadyApplied, task, onOpenForm }) {
  const router = useRouter();
  const user   = session?.user;
  const role   = user?.role;

  if (sessionLoading) {
    return (
      <div style={{ width: "100%", padding: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: COLORS.muted, fontSize: 14 }}>
        <Spinner color={COLORS.muted} /> Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => router.push("/login")}
          style={{ width: "100%", padding: 12, background: COLORS.accent, color: "#fff", border: "none", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          Login to Submit Proposal
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: COLORS.muted, margin: "8px 0 0" }}>You must be logged in to apply</p>
      </>
    );
  }

  if (role === "client") {
    return (
      <>
        <button disabled style={{ width: "100%", padding: 12, background: COLORS.card2, color: COLORS.muted, border: `1px solid ${COLORS.border2}`, borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "not-allowed" }}>
          Only Freelancers Can Apply
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: COLORS.muted, margin: "8px 0 0" }}>Switch to a freelancer account to bid</p>
      </>
    );
  }

  if (alreadyApplied) {
    return (
      <div style={{ background: COLORS.greenBg, border: "1px solid #1A4A38", borderRadius: 11, padding: 12, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: COLORS.green, fontWeight: 700 }}>✅ Proposal submitted!</p>
        <p style={{ margin: "3px 0 0", fontSize: 11, color: "#2D7A5A" }}>Check your proposals tab for updates.</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={onOpenForm}
        style={{ width: "100%", padding: 12, background: COLORS.accent, color: "#fff", border: "none", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
      >
        Submit a Proposal
      </button>
      <p style={{ textAlign: "center", fontSize: 11, color: COLORS.muted, margin: "8px 0 0" }}>Free to apply · No platform fee</p>
    </>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ visible, onDismiss }) {
  if (!visible) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: COLORS.card, color: COLORS.text, padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, zIndex: 1000, border: `1px solid ${COLORS.border2}` }}>
      🎉 Proposal submitted — the client will review it shortly.
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16, marginLeft: 8 }}>×</button>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function PageSkeleton() {
  const pulse = { animation: "pulse 1.5s ease-in-out infinite", background: COLORS.card2, borderRadius: 8 };
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 60px" }}>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`, padding: "22px 24px" }}>
            <div style={{ ...pulse, height: 20, width: "30%", marginBottom: 16 }} />
            <div style={{ ...pulse, height: 32, width: "80%", marginBottom: 18 }} />
            <div style={{ display: "flex", gap: 10 }}>
              {[1,2,3,4].map(i => <div key={i} style={{ ...pulse, height: 56, width: 110, borderRadius: 9 }} />)}
            </div>
          </div>
          <div style={{ background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`, padding: "22px 24px" }}>
            {[90,70,80,60,75].map((w,i) => <div key={i} style={{ ...pulse, height: 14, marginBottom: 10, width: `${w}%` }} />)}
          </div>
        </div>
        <div style={{ width: 300, flexShrink: 0 }}>
          <div style={{ background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`, padding: 20 }}>
            <div style={{ ...pulse, height: 48, marginBottom: 16 }} />
            <div style={{ ...pulse, height: 96, marginBottom: 16 }} />
            <div style={{ ...pulse, height: 44, borderRadius: 11 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TaskDetailsPage() {
  // ✅ taskId comes from Next.js App Router URL params — no prop needed
  const params = useParams();
  const taskId = params?.id;

  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [task, setTask]           = useState(null);
  const [taskLoading, setTaskLoading] = useState(true);
  const [taskError, setTaskError] = useState("");

  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [showForm, setShowForm]   = useState(false);
  const [showToast, setShowToast] = useState(false);

  // ── Fetch task from real backend ──────────────────────────────────────────
  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    setTaskLoading(true);
    setTaskError("");
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/tasks/${taskId}`);
      setTask(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400 || status === 404) setTaskError("This task could not be found. It may have been removed.");
      else if (!err.response)              setTaskError("Network error — please check your connection and try again.");
      else                                 setTaskError("Failed to load task details. Please try refreshing the page.");
    } finally {
      setTaskLoading(false);
    }
  }, [taskId]);

  // ── Check proposal status — only if backend has proposals API ─────────────
  // If /api/proposals/check/:taskId doesn't exist yet, it gracefully fails
  // and defaults to alreadyApplied = false (the submit API will catch a 409).
  const checkProposalStatus = useCallback(async () => {
    const user = session?.user;
    if (!user || user.role !== "freelancer" || !taskId) return;
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/api/proposals/check/${taskId}`,
        { withCredentials: true }
      );
      setAlreadyApplied(!!data?.alreadyApplied);
    } catch {
      // Proposals API not built yet — silently ignore, form will catch 409
      setAlreadyApplied(false);
    }
  }, [taskId, session?.user]);

  useEffect(() => { fetchTask(); }, [fetchTask]);

  useEffect(() => {
    if (!sessionLoading) checkProposalStatus();
  }, [checkProposalStatus, sessionLoading]);

  // ── After successful proposal ─────────────────────────────────────────────
  const handleSuccess = () => {
    setShowForm(false);
    setAlreadyApplied(true);
    setShowToast(true);
    setTask(prev => prev ? { ...prev, proposals_count: (prev.proposals_count || 0) + 1 } : prev);
    setTimeout(() => setShowToast(false), 5000);
  };

  // ── Render: loading ───────────────────────────────────────────────────────
  if (taskLoading) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "Inter,system-ui,sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}} *{box-sizing:border-box}`}</style>
        <PageSkeleton />
      </div>
    );
  }

  // ── Render: error ─────────────────────────────────────────────────────────
  if (taskError || !task) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "Inter,system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`*{box-sizing:border-box}`}</style>
        <div style={{ textAlign: "center", maxWidth: 400, padding: 32 }}>
          <p style={{ fontSize: 48, margin: "0 0 16px" }}>⚠️</p>
          <h2 style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>Task not available</h2>
          <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>{taskError || "This task could not be found."}</p>
          <button
            onClick={() => router.push("/tasks")}
            style={{ padding: "10px 20px", background: COLORS.accent, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Browse Tasks
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const card     = { background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`, padding: "22px 24px" };
  const metaRow  = { display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 12 };

  // ── Render: main page ─────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "Inter,system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .dg { flex-direction: column !important; }
          .sb { width: 100% !important; }
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.muted }}>
          <a href="/tasks" style={{ color: COLORS.accent2, textDecoration: "none", fontWeight: 500 }}>Browse Tasks</a>
          <span>/</span>
          <span>{task.category}</span>
          <span>/</span>
          <span style={{ color: COLORS.text, fontWeight: 500 }}>{task.title.slice(0, 30)}...</span>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 60px", animation: "fadeIn 0.4s ease" }}>
        <div className="dg" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* ── Left Column ── */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Header Card */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                  <Badge category={task.category} />
                  <StatusBadge status={task.status} />
                </div>
                <span style={{ fontSize: 11, color: COLORS.muted }}>
                  Posted {new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, margin: "0 0 14px", lineHeight: 1.3, letterSpacing: "-0.4px" }}>
                {task.title}
              </h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { icon: "💰", label: "Budget",    value: `$${task.budget}` },
                  { icon: "📅", label: "Deadline",  value: new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                  { icon: "⏰", label: "Days left",  value: daysLeft > 0 ? `${daysLeft} days` : "Expired", urgent: daysLeft <= 5 },
                  { icon: "📋", label: "Proposals", value: `${task.proposals_count ?? 0} bids` },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.card2, padding: "7px 12px", borderRadius: 9, border: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: item.urgent ? COLORS.red : item.label === "Days left" ? COLORS.green : COLORS.text }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={card}>
              <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>📝 Task description</p>
              <p style={{ fontSize: 14, color: "#B0B6CC", lineHeight: 1.8, whiteSpace: "pre-line", margin: 0 }}>{task.description}</p>
            </div>

            {/* Deliverables */}
            <div style={card}>
              <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}>✅ Deliverables expected</p>
              {(task.deliverables?.length
                ? task.deliverables
                : ["SVG source file (vector, scalable)", "PNG exports — light and dark background", "Brand guideline PDF (fonts, colors, usage)", "3 initial concept variations"]
              ).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 9 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#2D2B52", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ color: COLORS.accent, fontSize: 10, fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 13, color: "#B0B6CC", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Tip Box */}
            <div style={{ background: "#1E1C35", borderRadius: 14, border: "1px solid #3A3560", padding: "16px 20px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: 13, fontWeight: 700, color: "#A79EFC" }}>Tips for a strong proposal</p>
                <p style={{ margin: 0, fontSize: 12, color: "#7B7AAA", lineHeight: 1.6 }}>Share your portfolio, mention similar past work, and explain your design process. Clients prefer proposals that directly address their brand requirements.</p>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="sb" style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* CTA Card */}
            <div style={{ ...card, padding: 20, position: "sticky", top: 20 }}>
              <p style={{ textAlign: "center", fontSize: 12, color: COLORS.muted, fontWeight: 500, margin: "0 0 4px" }}>Project Budget</p>
              <p style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: COLORS.text, letterSpacing: "-1px", margin: "0 0 14px" }}>
                ${task.budget} <span style={{ fontSize: 14, color: COLORS.muted, fontWeight: 500 }}>USD</span>
              </p>
              <div style={{ background: COLORS.card2, borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: `1px solid ${COLORS.border}` }}>
                <div style={metaRow}><span style={{ color: COLORS.muted }}>Deadline</span><span style={{ fontWeight: 600, color: COLORS.text }}>{new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
                <div style={metaRow}><span style={{ color: COLORS.muted }}>Time left</span><span style={{ fontWeight: 600, color: COLORS.green }}>{daysLeft > 0 ? `${daysLeft} days` : "Expired"}</span></div>
                <div style={{ ...metaRow, marginBottom: 0 }}><span style={{ color: COLORS.muted }}>Proposals</span><span style={{ fontWeight: 600, color: COLORS.text }}>{task.proposals_count ?? 0}</span></div>
              </div>

              <ProposalCTA
                session={session}
                sessionLoading={sessionLoading}
                alreadyApplied={alreadyApplied}
                task={task}
                onOpenForm={() => setShowForm(true)}
              />
            </div>

            {/* Client Card */}
            <div style={card}>
              <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, margin: "0 0 13px" }}>About the client</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Avatar name={task.client_name || "Client"} size={38} />
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLORS.text }}>{task.client_name || "Anonymous"}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.muted }}>Verified Client</p>
                </div>
              </div>
              {[
                ["Member since", new Date(task.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })],
                ["Avg. response", "< 2 hours"],
                ["Hired rate",    "83%"],
              ].map(([k, v]) => (
                <div key={k} style={{ ...metaRow, marginBottom: 7 }}>
                  <span style={{ color: COLORS.muted }}>{k}</span>
                  <span style={{ fontWeight: 600, color: COLORS.text }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Safety Notice */}
            <div style={{ borderRadius: 11, border: "1px solid #3A2E00", background: COLORS.yellowBg, padding: "12px 14px" }}>
              <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 700, color: COLORS.yellow }}>🔒 Stay protected</p>
              <p style={{ margin: 0, fontSize: 11, color: "#9A8040", lineHeight: 1.6 }}>All payments go through SkillSwap's Stripe escrow. Never pay outside the platform.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      {showForm && (
        <ProposalForm
          task={task}
          currentUser={session?.user}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Success Toast */}
      <Toast visible={showToast} onDismiss={() => setShowToast(false)} />
    </div>
  );
}