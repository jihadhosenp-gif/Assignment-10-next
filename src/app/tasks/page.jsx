"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, DollarSign, User, ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";

const CATEGORY_COLORS = {
  Design:      { bg: "bg-violet-500/10", text: "text-violet-400",  dot: "bg-violet-400" },
  Writing:     { bg: "bg-amber-500/10",  text: "text-amber-400",   dot: "bg-amber-400"  },
  Development: { bg: "bg-sky-500/10",    text: "text-sky-400",     dot: "bg-sky-400"    },
  Marketing:   { bg: "bg-rose-500/10",   text: "text-rose-400",    dot: "bg-rose-400"   },
  Other:       { bg: "bg-zinc-700/40",   text: "text-zinc-400",    dot: "bg-zinc-500"   },
};

const STATUS_COLORS = {
  open:        { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  closed:      { bg: "bg-red-500/10",     text: "text-red-400",     dot: "bg-red-400"     },
  "in-progress":{ bg: "bg-yellow-500/10", text: "text-yellow-400",  dot: "bg-yellow-400"  },
};

function CategoryBadge({ category }) {
  const style = CATEGORY_COLORS[category] || CATEGORY_COLORS["Other"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {category}
    </span>
  );
}

function StatusBadge({ status }) {
  const key = status?.toLowerCase() || "open";
  const style = STATUS_COLORS[key] || STATUS_COLORS["open"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${style.dot}`} />
      {status}
    </span>
  );
}

function TaskCard({ task }) {
  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-zinc-600 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300">

      {/* Subtle top glow on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

      {/* Top badges */}
      <div className="flex items-center justify-between">
        <CategoryBadge category={task.category} />
        <StatusBadge status={task.status} />
      </div>

      {/* Title */}
      <h2 className="text-lg font-bold text-zinc-100 leading-snug group-hover:text-white transition-colors line-clamp-2">
        {task.title}
      </h2>

      {/* Description */}
      <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3 flex-1">
        {task.description}
      </p>

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* Meta info */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex flex-col items-start gap-1">
          <span className="text-zinc-600 uppercase tracking-wide font-medium text-[10px]">Budget</span>
          <span className="flex items-center gap-1 font-semibold text-zinc-300">
            <DollarSign size={13} className="text-emerald-400" />
            {task.budget}
          </span>
        </div>

        <div className="flex flex-col items-start gap-1">
          <span className="text-zinc-600 uppercase tracking-wide font-medium text-[10px]">Deadline</span>
          <span className="flex items-center gap-1 font-semibold text-zinc-300">
            <Calendar size={13} className="text-sky-400" />
            {task.deadline}
          </span>
        </div>

        <div className="flex flex-col items-start gap-1">
          <span className="text-zinc-600 uppercase tracking-wide font-medium text-[10px]">Client</span>
          <span className="flex items-center gap-1 font-semibold text-zinc-300 truncate">
            <User size={13} className="text-violet-400 shrink-0" />
            <span className="truncate">{task.client_name || "Client"}</span>
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/tasks/${task._id}`}
        className="flex items-center justify-center gap-2 mt-1 bg-white text-zinc-900 text-sm font-bold py-3 rounded-xl hover:bg-zinc-100 active:scale-[0.98] transition-all"
      >
        View Details
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-6 w-20 bg-zinc-800 rounded-full" />
        <div className="h-6 w-16 bg-zinc-800 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-zinc-800 rounded-lg" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-zinc-800 rounded" />
        <div className="h-3 w-5/6 bg-zinc-800 rounded" />
        <div className="h-3 w-4/6 bg-zinc-800 rounded" />
      </div>
      <div className="border-t border-zinc-800" />
      <div className="grid grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-2 w-10 bg-zinc-800 rounded" />
            <div className="h-4 w-14 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
      <div className="h-11 bg-zinc-800 rounded-xl mt-1" />
    </div>
  );
}

const CATEGORIES = ["All", "Design", "Writing", "Development", "Marketing", "Other"];

export default function BrowseTasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setFilteredTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = [...tasks];
    if (search) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category !== "All") {
      filtered = filtered.filter((task) => task.category === category);
    }
    setFilteredTasks(filtered);
  }, [search, category, tasks]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-zinc-500 font-semibold text-sm mb-3">
            <Briefcase size={15} />
            Freelance Marketplace
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Browse Tasks
          </h1>
          <p className="text-zinc-500 mt-2 text-base">
            Find freelance opportunities and submit your proposals.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 mb-8">

          {/* Search */}
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${category === cat
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-zinc-600 mb-5">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={28} className="text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-300">No tasks found</h2>
            <p className="text-zinc-600 mt-1 text-sm">
              Try a different keyword or category.
            </p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="mt-5 px-5 py-2.5 bg-white text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-100 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}