"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Briefcase,
  Clock3,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  ListTodo,
  Users,
  ArrowUpRight,
  Loader2,
  TrendingUp,
  Bell,
} from "lucide-react";

export default function DashboardStats() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalTasks: 0,
    openTasks: 0,
    inProgress: 0,
    completed: 0,
    totalSpent: 0,
  });

  const user = {
    email: "client@gmail.com",
    name: "Client",
  };

  useEffect(() => {
    if (!user?.email) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/dashboard-stats/${user.email}`
        );
        setStats(res.data);
      } catch (error) {
        console.error("Dashboard Stats Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.email]);

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: Briefcase,
      accent: "indigo",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-400",
      border: "hover:border-indigo-500/30",
    },
    {
      title: "Open Tasks",
      value: stats.openTasks,
      icon: Clock3,
      accent: "emerald",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      border: "hover:border-emerald-500/30",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: ListTodo,
      accent: "amber",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      border: "hover:border-amber-500/30",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      accent: "sky",
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-400",
      border: "hover:border-sky-500/30",
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent}`,
      icon: DollarSign,
      accent: "pink",
      iconBg: "bg-pink-500/10",
      iconColor: "text-pink-400",
      border: "hover:border-pink-500/30",
    },
  ];

  const recentTasks = [
    {
      title: "React Website Development",
      category: "Web Development",
      status: "Open",
      statusStyle: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
    },
    {
      title: "Mobile App UI Design",
      category: "UI/UX Design",
      status: "In Progress",
      statusStyle: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
    },
    {
      title: "Landing Page Design",
      category: "Frontend",
      status: "Completed",
      statusStyle: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20",
    },
  ];

  const activities = [
    {
      title: "New proposal received",
      subtitle: "React Website Development",
      dot: "bg-emerald-500",
      time: "2 min ago",
    },
    {
      title: "Task moved to In Progress",
      subtitle: "Mobile App UI Design",
      dot: "bg-amber-500",
      time: "1 hr ago",
    },
    {
      title: "Task completed",
      subtitle: "Landing Page Design",
      dot: "bg-sky-500",
      time: "3 hr ago",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-indigo-500" />
          <p className="text-sm text-zinc-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-7">
        {/* decorative orbs */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute right-16 -bottom-14 h-36 w-36 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            {/* online badge */}
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All systems running
            </span>

            <h1 className="text-2xl font-semibold text-white">
              Welcome back, {user.name} 👋
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
              Manage tasks, review proposals, and collaborate with freelancers
              — all from one place.
            </p>
          </div>

          {/* notification bell */}
          <button className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-white/80 transition hover:bg-white/20">
            <Bell size={18} />
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-200 ${card.border}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    {card.title}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {card.value}
                  </h3>
                </div>
                <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                  <Icon size={20} className={card.iconColor} />
                </div>
              </div>

              {/* subtle bottom accent line */}
              <div
                className={`absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-300 group-hover:w-full
                  ${card.accent === "indigo" ? "from-indigo-500 to-indigo-400" : ""}
                  ${card.accent === "emerald" ? "from-emerald-500 to-emerald-400" : ""}
                  ${card.accent === "amber" ? "from-amber-500 to-amber-400" : ""}
                  ${card.accent === "sky" ? "from-sky-500 to-sky-400" : ""}
                  ${card.accent === "pink" ? "from-pink-500 to-pink-400" : ""}
                `}
              />
            </div>
          );
        })}
      </div>

      {/* ── Middle Row ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Recent Tasks */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Tasks</h2>
            <button className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-700 hover:text-white">
              View all
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTasks.map((task, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/40 px-4 py-3 transition hover:border-zinc-700 hover:bg-zinc-800/80"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-zinc-700/60 flex items-center justify-center">
                    <Briefcase size={14} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {task.title}
                    </p>
                    <p className="text-xs text-zinc-500">{task.category}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${task.statusStyle}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-base font-semibold text-white">
            Quick Actions
          </h2>

          <div className="space-y-2.5">
            <button className="group flex w-full items-center justify-between rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-medium text-white transition hover:bg-indigo-500">
              <span className="flex items-center gap-2.5">
                <PlusCircle size={16} />
                Post a New Task
              </span>
              <ArrowUpRight size={15} className="opacity-70 transition group-hover:opacity-100" />
            </button>

            <button className="group flex w-full items-center justify-between rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white">
              <span className="flex items-center gap-2.5">
                <Briefcase size={16} />
                My Tasks
              </span>
              <ArrowUpRight size={15} className="opacity-40 transition group-hover:opacity-80" />
            </button>

            <button className="group flex w-full items-center justify-between rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white">
              <span className="flex items-center gap-2.5">
                <Users size={16} />
                Browse Freelancers
              </span>
              <ArrowUpRight size={15} className="opacity-40 transition group-hover:opacity-80" />
            </button>

            <button className="group flex w-full items-center justify-between rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white">
              <span className="flex items-center gap-2.5">
                <TrendingUp size={16} />
                View Reports
              </span>
              <ArrowUpRight size={15} className="opacity-40 transition group-hover:opacity-80" />
            </button>
          </div>
        </div>

      </div>

      {/* ── Activity Timeline ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-5 text-base font-semibold text-white">
          Recent Activity
        </h2>

        <div className="space-y-0">
          {activities.map((item, i) => (
            <div key={i} className="flex gap-4">
              {/* timeline line */}
              <div className="flex flex-col items-center">
                <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${item.dot}`} />
                {i < activities.length - 1 && (
                  <div className="mt-1.5 w-px flex-1 bg-zinc-800" style={{ minHeight: "32px" }} />
                )}
              </div>

              {/* content */}
              <div className={`pb-5 flex-1 ${i === activities.length - 1 ? "pb-0" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{item.subtitle}</p>
                  </div>
                  <span className="ml-4 flex-shrink-0 text-xs text-zinc-600">
                    {item.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}