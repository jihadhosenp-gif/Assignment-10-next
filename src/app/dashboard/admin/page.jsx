"use client"

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Users, ListChecks, Wallet, Settings, LogOut,
  Search, Bell, Moon, Menu, X, PanelLeft, RefreshCw, Trash2,
  Lock, Unlock, Download, Printer, Camera, CheckCircle2,
  DollarSign, Activity, Sparkles,
  UserPlus, ClipboardCheck, CreditCard, AlertCircle,
} from "lucide-react";

/* ----------------------------- API config ----------------------------- */

// Point this at your Express server. Set NEXT_PUBLIC_API_URL in your .env
// for production; it falls back to localhost for local development.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function apiRequest(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // response had no JSON body — keep the default message
    }
    throw new Error(message);
  }
  return res.json();
}

const apiGet = (path) => apiRequest(path);
const apiPatch = (path, body) => apiRequest(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined });
const apiDelete = (path) => apiRequest(path, { method: "DELETE" });

/* ----------------------------- Static config ----------------------------- */
/* These describe the shape of the UI itself, not server data, so they stay. */

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "users", label: "Manage Users", icon: Users },
  { key: "tasks", label: "Manage Tasks", icon: ListChecks },
  { key: "transactions", label: "Transactions", icon: Wallet },
  { key: "settings", label: "Settings", icon: Settings },
];

const PAGE_TITLES = {
  dashboard: "Dashboard",
  users: "Manage Users",
  tasks: "Manage Tasks",
  transactions: "Transactions",
  settings: "Settings",
};

const ACTIVITY_COLORS = {
  violet: { bg: "bg-violet-500/10", text: "text-violet-400" },
  green: { bg: "bg-green-500/10", text: "text-green-400" },
  yellow: { bg: "bg-yellow-400/10", text: "text-yellow-400" },
  red: { bg: "bg-red-500/10", text: "text-red-400" },
};

// Maps the activity "type" the server sends back to an icon + color.
const ACTIVITY_TYPE_MAP = {
  client_joined:     { icon: UserPlus, color: "violet" },
  freelancer_joined: { icon: UserPlus, color: "violet" },
  task_completed:    { icon: ClipboardCheck, color: "green" },
  project_started:   { icon: CreditCard, color: "yellow" },
};
const DEFAULT_ACTIVITY_STYLE = { icon: AlertCircle, color: "red" };

// Roles a user can be assigned from the admin panel. Must match the
// `allowedRoles` list in the server's /api/admin/users/:id/set-role route.
const ASSIGNABLE_ROLES = ["Freelancer", "Client", "admin"];

/* ----------------------------- Helpers ----------------------------- */

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatCurrency(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `$${n.toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return typeof value === "string" ? value : "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function timeAgo(value) {
  if (!value) return "";
  const diffMs = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diffMs)) return "";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

/* ----------------------------- StatusBadge ----------------------------- */

function StatusBadge({ status }) {
  const map = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    paid: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    "in progress": "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    blocked: "bg-red-500/10 text-red-400 border-red-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const cls = map[(status || "").toLowerCase()] || "bg-violet-500/10 text-violet-400 border-violet-500/20";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status || "Unknown"}
    </span>
  );
}

/* ----------------------------- SearchBar ----------------------------- */

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1 min-w-[180px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all duration-300"
      />
    </div>
  );
}

/* ----------------------------- LoadingSkeleton ----------------------------- */

function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
      ))}
    </div>
  );
}

/* ----------------------------- EmptyState ----------------------------- */

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-zinc-500" />
      </div>
      <p className="text-white font-medium mb-1">{title}</p>
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}

/* ----------------------------- ErrorBanner ----------------------------- */

function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-red-400">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-medium text-red-300 hover:text-white transition-colors duration-300 whitespace-nowrap"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/* ----------------------------- ConfirmModal ----------------------------- */

function ConfirmModal({ open, title, message, confirmLabel, danger, busy, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-3xl border border-white/[0.08] bg-[#111111] p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-sm text-zinc-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-zinc-300 hover:bg-white/[0.04] transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 ${
              danger ? "bg-red-500 hover:bg-red-600 text-white" : "bg-violet-500 hover:bg-purple-500 text-white"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- StatCard ----------------------------- */

const ACCENTS = {
  violet: { line: "from-violet-500 to-purple-500", glow: "hover:shadow-violet-500/20", iconBg: "bg-violet-500/10", iconColor: "text-violet-400" },
  green: { line: "from-green-500 to-emerald-400", glow: "hover:shadow-green-500/20", iconBg: "bg-green-500/10", iconColor: "text-green-400" },
  yellow: { line: "from-yellow-400 to-amber-500", glow: "hover:shadow-yellow-400/20", iconBg: "bg-yellow-400/10", iconColor: "text-yellow-400" },
  red: { line: "from-red-500 to-rose-500", glow: "hover:shadow-red-500/20", iconBg: "bg-red-500/10", iconColor: "text-red-400" },
};

function StatCard({ icon: Icon, label, value, description, accent }) {
  const a = ACCENTS[accent] || ACCENTS.violet;
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-6 transition-all duration-300 hover:scale-105 hover:border-violet-500/40 hover:shadow-2xl ${a.glow}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${a.line}`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${a.iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${a.iconColor}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight mb-1">{value}</p>
      <p className="text-sm font-medium text-zinc-300 mb-1">{label}</p>
      <p className="text-xs text-zinc-500">{description}</p>
    </div>
  );
}

/* ----------------------------- DashboardCards ----------------------------- */

function DashboardCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[148px] rounded-3xl bg-white/[0.04] border border-white/[0.08] animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon={Users} label="Total Users" value={stats.totalUsers ?? 0} description="Across all roles" accent="violet" />
      <StatCard icon={ListChecks} label="Total Tasks" value={stats.totalTasks ?? 0} description="Posted on the platform" accent="yellow" />
      <StatCard icon={Activity} label="Active Tasks" value={stats.activeTasks ?? 0} description="Currently in progress" accent="green" />
      <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats.totalRevenue ?? 0)} description="From completed projects" accent="red" />
    </div>
  );
}

/* ----------------------------- RecentActivities ----------------------------- */

function RecentActivities({ activities, loading, error }) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold tracking-tight">Recent Activities</h3>
      </div>
      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorBanner message={error} />
      ) : activities.length === 0 ? (
        <EmptyState icon={Activity} title="No activity yet" message="New signups, tasks, and projects will show up here." />
      ) : (
        <div className="space-y-5 max-h-80 overflow-y-auto pr-1">
          {activities.map((a, i) => {
            const conf = ACTIVITY_TYPE_MAP[a.type] || DEFAULT_ACTIVITY_STYLE;
            const c = ACTIVITY_COLORS[conf.color];
            const Icon = conf.icon;
            return (
              <div key={a.id || i} className="relative flex gap-4">
                {i !== activities.length - 1 && (
                  <span className="absolute left-[19px] top-10 bottom-[-20px] w-px bg-white/[0.08]" />
                )}
                <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
                  <Icon className={`w-4 h-4 ${c.text}`} />
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm text-zinc-300">{a.text}</p>
                  <p className="text-xs text-zinc-500 mt-1">{timeAgo(a.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- LatestPayments ----------------------------- */

function LatestPayments({ payments, loading, error }) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold tracking-tight">Latest Payments</h3>
      </div>
      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorBanner message={error} />
      ) : payments.length === 0 ? (
        <EmptyState icon={Wallet} title="No payments yet" message="Payments appear once a proposal is accepted." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider">
                <th className="pb-3 font-medium">Freelancer</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.03] transition-colors duration-300">
                  <td className="py-3 text-zinc-300 whitespace-nowrap">{p.name}</td>
                  <td className="py-3 text-white font-medium whitespace-nowrap">{formatCurrency(p.amount)}</td>
                  <td className="py-3 text-zinc-400 whitespace-nowrap">{p.method}</td>
                  <td className="py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- DashboardHome ----------------------------- */

function DashboardHome() {
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, activitiesRes, paymentsRes] = await Promise.all([
        apiGet("/api/admin/stats"),
        apiGet("/api/admin/activities?limit=8"),
        apiGet("/api/admin/payments?limit=5"),
      ]);
      setStats(statsRes);
      setActivities(activitiesRes);
      setPayments(paymentsRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-8">
      <DashboardCards stats={stats} loading={loading} />
      {error && <ErrorBanner message={error} onRetry={load} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivities activities={activities} loading={loading} error={loading ? "" : error} />
        <LatestPayments payments={payments} loading={loading} error={loading ? "" : error} />
      </div>
    </div>
  );
}

/* ----------------------------- RoleSelect ----------------------------- */
/* Small dropdown used inline in the users table — lets an admin change a
   user's role directly. Disabled while a change for that row is in flight
   so a double-click can't fire two requests. */

function RoleSelect({ value, disabled, onChange }) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300 focus:outline-none focus:border-violet-500/50 transition-all duration-300 disabled:opacity-50"
    >
      {ASSIGNABLE_ROLES.map((r) => (
        <option key={r} value={r} className="bg-[#111111] text-zinc-300">{r}</option>
      ))}
    </select>
  );
}

/* ----------------------------- UsersTable ----------------------------- */

function UsersTable({ users, roleUpdatingId, onToggle, onRoleChange }) {
  if (users.length === 0) {
    return <EmptyState icon={Users} title="No users found" message="Try adjusting your search or filter." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[760px]">
        <thead>
          <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider border-b border-white/[0.08]">
            <th className="px-6 py-4 font-medium">User</th>
            <th className="px-6 py-4 font-medium">Email</th>
            <th className="px-6 py-4 font-medium">Role</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Joined</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-white/[0.03] transition-colors duration-300">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {initials(u.name)}
                  </div>
                  <span className="text-white font-medium whitespace-nowrap">{u.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">{u.email}</td>
              <td className="px-6 py-4">
                <RoleSelect
                  value={u.role}
                  disabled={roleUpdatingId === u.id}
                  onChange={(newRole) => onRoleChange(u, newRole)}
                />
              </td>
              <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
              <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">{u.joined}</td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onToggle(u)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                    u.status === "Active" ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  }`}
                >
                  {u.status === "Active" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  {u.status === "Active" ? "Block" : "Unblock"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [roleUpdatingId, setRoleUpdatingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/admin/users");
      setUsers(
        data.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          joined: formatDate(u.joined),
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  async function confirmAction() {
    setBusy(true);
    try {
      const res = await apiPatch(`/api/admin/users/${confirm.user.id}/toggle-status`);
      setUsers((prev) => prev.map((u) => (u.id === confirm.user.id ? { ...u, status: res.status } : u)));
      setConfirm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Changes a user's role. Hits /api/admin/users/:id/set-role, which updates
  // both the skill-swap.users collection (shown in this table) and the
  // auth-db.user collection (the source Better Auth reads sessions from).
  // The user being changed needs to log out/in again for a new session role
  // to take effect on their end.
  async function handleRoleChange(user, newRole) {
    if (newRole === user.role) return;
    setError("");
    setRoleUpdatingId(user.id);
    try {
      const res = await apiPatch(`/api/admin/users/${user.id}/set-role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: res.role } : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setRoleUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 transition-all duration-300"
        >
          {["All", ...ASSIGNABLE_ROLES].map((r) => (
            <option key={r} className="bg-[#111111] text-zinc-300">{r}</option>
          ))}
        </select>
        <button
          onClick={load}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 hover:border-violet-500/40 hover:text-white transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl overflow-hidden">
        {loading ? <LoadingSkeleton rows={6} /> : (
          <UsersTable
            users={filtered}
            roleUpdatingId={roleUpdatingId}
            onToggle={(user) => setConfirm({ user, action: user.status === "Active" ? "Block" : "Unblock" })}
            onRoleChange={handleRoleChange}
          />
        )}
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm ? `${confirm.action} ${confirm.user.name}?` : ""}
        message={confirm ? `This will ${confirm.action.toLowerCase()} access for this user immediately.` : ""}
        confirmLabel={confirm?.action}
        danger={confirm?.action === "Block"}
        busy={busy}
        onConfirm={confirmAction}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

/* ----------------------------- TasksTable ----------------------------- */

function TasksTable({ tasks, onDelete }) {
  if (tasks.length === 0) {
    return <EmptyState icon={ListChecks} title="No tasks found" message="Try adjusting your filters." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[860px]">
        <thead>
          <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider border-b border-white/[0.08]">
            <th className="px-6 py-4 font-medium">Task</th>
            <th className="px-6 py-4 font-medium">Category</th>
            <th className="px-6 py-4 font-medium">Budget</th>
            <th className="px-6 py-4 font-medium">Client</th>
            <th className="px-6 py-4 font-medium">Deadline</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-white/[0.03] transition-colors duration-300">
              <td className="px-6 py-4 text-white font-medium whitespace-nowrap">{t.title}</td>
              <td className="px-6 py-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 whitespace-nowrap">
                  {t.category}
                </span>
              </td>
              <td className="px-6 py-4 text-zinc-300 whitespace-nowrap">{t.budget}</td>
              <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">{t.client}</td>
              <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">{t.deadline}</td>
              <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onDelete(t)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ManageTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/tasks");
      setTasks(
        data.map((t) => ({
          id: t._id,
          title: t.title,
          category: t.category,
          budget: typeof t.budget === "number" ? formatCurrency(t.budget) : (t.budget || "—"),
          client: t.client_name || t.client_email || "—",
          deadline: formatDate(t.deadline),
          status: t.status,
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = ["All", ...new Set(tasks.map((t) => t.category).filter(Boolean))];
  const statuses = ["All", ...new Set(tasks.map((t) => t.status).filter(Boolean))];

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = (t.title || "").toLowerCase().includes(q) || (t.client || "").toLowerCase().includes(q);
    const matchCat = category === "All" || t.category === category;
    const matchStatus = status === "All" || t.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  async function confirmDelete() {
    setBusy(true);
    try {
      await apiDelete(`/api/tasks/${confirm.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== confirm.id));
      setConfirm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search tasks..." />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 transition-all duration-300"
        >
          {categories.map((c) => (
            <option key={c} className="bg-[#111111] text-zinc-300">{c}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 transition-all duration-300"
        >
          {statuses.map((s) => (
            <option key={s} className="bg-[#111111] text-zinc-300">{s}</option>
          ))}
        </select>
        <button
          onClick={load}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 hover:border-violet-500/40 hover:text-white transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl overflow-hidden">
        {loading ? <LoadingSkeleton rows={6} /> : <TasksTable tasks={filtered} onDelete={setConfirm} />}
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm ? `Delete "${confirm.title}"?` : ""}
        message="This action cannot be undone. The task will be permanently removed."
        confirmLabel="Delete"
        danger
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

/* ----------------------------- TransactionsTable ----------------------------- */

function TransactionsTable({ transactions }) {
  if (transactions.length === 0) {
    return <EmptyState icon={Wallet} title="No transactions found" message="Try a different search or status." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[780px]">
        <thead>
          <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider border-b border-white/[0.08]">
            <th className="px-6 py-4 font-medium">Client Email</th>
            <th className="px-6 py-4 font-medium">Freelancer Email</th>
            <th className="px-6 py-4 font-medium">Payout</th>
            <th className="px-6 py-4 font-medium">Date</th>
            <th className="px-6 py-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-white/[0.03] transition-colors duration-300">
              <td className="px-6 py-4 text-zinc-300 whitespace-nowrap">{t.clientEmail}</td>
              <td className="px-6 py-4 text-zinc-300 whitespace-nowrap">{t.freelancerEmail}</td>
              <td className="px-6 py-4 text-white font-medium whitespace-nowrap">{t.payout}</td>
              <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">{t.date}</td>
              <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/admin/transactions");
      setTransactions(
        data.map((t) => ({
          id: t.id,
          clientEmail: t.clientEmail,
          freelancerEmail: t.freelancerEmail,
          payout: formatCurrency(t.payout),
          date: formatDate(t.date),
          status: t.status,
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statuses = ["All", ...new Set(transactions.map((t) => t.status).filter(Boolean))];

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = (t.clientEmail || "").toLowerCase().includes(q) || (t.freelancerEmail || "").toLowerCase().includes(q);
    const matchStatus = status === "All" || t.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by email..." />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 transition-all duration-300"
        >
          {statuses.map((s) => (
            <option key={s} className="bg-[#111111] text-zinc-300">{s}</option>
          ))}
        </select>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 hover:border-violet-500/40 hover:text-white transition-all duration-300">
          <Download className="w-4 h-4" /> Export
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 hover:border-violet-500/40 hover:text-white transition-all duration-300">
          <Printer className="w-4 h-4" /> Print
        </button>
        <button
          onClick={load}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 hover:border-violet-500/40 hover:text-white transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <ErrorBanner message={error} onRetry={load} />

      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl overflow-hidden">
        {loading ? <LoadingSkeleton rows={6} /> : <TransactionsTable transactions={filtered} />}
      </div>
    </div>
  );
}

/* ----------------------------- SettingsPage ----------------------------- */
/* NOTE: there's no admin-profile endpoint in the server yet, so this page
   stays local-only for now. If you add an /api/admin/profile route later,
   wire it up here the same way the other pages call apiGet / apiPatch. */

function SettingsPage() {
  const [name, setName] = useState("Amelia Hart");
  const [email, setEmail] = useState("amelia.hart@taskhub.com");
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-8">
        <h3 className="text-white font-semibold text-lg tracking-tight mb-1">Profile Settings</h3>
        <p className="text-sm text-zinc-500 mb-8">Update your account details and password.</p>

        <div className="flex items-center gap-5 mb-8">
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold shadow-lg shadow-violet-500/30">
            AH
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-[#111111] border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-white hover:border-violet-500/40 transition-all duration-300"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <p className="text-white font-medium">{name}</p>
            <p className="text-sm text-zinc-500">Super Admin</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all duration-300"
            />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300"
            >
              Update Profile
            </button>
            {saved && (
              <span className="text-sm text-green-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Saved successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ----------------------------- AdminSidebar ----------------------------- */

function AdminSidebar({ active, onNavigate, collapsed, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed z-50 inset-y-0 left-0 flex flex-col bg-[#111111] border-r border-white/[0.08] transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between gap-3 px-6 h-20 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && <span className="text-white font-semibold text-lg tracking-tight whitespace-nowrap">TaskHub</span>}
          </div>
          {mobileOpen && (
            <button onClick={onCloseMobile} className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-300">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-violet-500/10 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
                )}
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-violet-400" : ""}`} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-6 border-t border-white/[0.08]">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300">
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ----------------------------- AdminNavbar ----------------------------- */

function AdminNavbar({ title, search, onSearchChange, onMenuClick, onToggleCollapse }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-20 px-4 sm:px-8 backdrop-blur-xl bg-[rgba(15,15,15,0.8)] border-b border-white/[0.08] shadow-lg shadow-black/20">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-300">
        <Menu className="w-5 h-5" />
      </button>
      <button onClick={onToggleCollapse} className="hidden lg:flex p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-300">
        <PanelLeft className="w-5 h-5" />
      </button>
      <div className="hidden sm:block">
        <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
        <p className="text-xs text-zinc-500">{today}</p>
      </div>
      <div className="flex-1 max-w-md hidden md:flex justify-end px-2">
        <SearchBar value={search} onChange={onSearchChange} placeholder="Search anything..." />
      </div>
      <div className="flex items-center gap-2 sm:gap-3 ml-auto md:ml-0">
        <button className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-300">
          <Moon className="w-5 h-5" />
        </button>
        <button className="relative p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-300">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0f0f0f]" />
        </button>
        <div className="flex items-center gap-3 pl-3 border-l border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-violet-500/20 shrink-0">
            AH
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight whitespace-nowrap">Amelia Hart</p>
            <p className="text-xs text-zinc-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------- AdminDashboard (root) ----------------------------- */

export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  function navigate(key) {
    setActive(key);
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative">
      <div className="fixed top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <AdminSidebar
        active={active}
        onNavigate={navigate}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <AdminNavbar
          title={PAGE_TITLES[active]}
          search={navSearch}
          onSearchChange={setNavSearch}
          onMenuClick={() => setMobileOpen(true)}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        {/* Each page fetches its own data on mount, so switching tabs always
            pulls fresh data from the server. */}
        <main className="bg-[#0B0B0F] min-h-[calc(100vh-5rem)] p-4 sm:p-8">
          {active === "dashboard" && <DashboardHome />}
          {active === "users" && <ManageUsersPage />}
          {active === "tasks" && <ManageTasksPage />}
          {active === "transactions" && <TransactionsPage />}
          {active === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}