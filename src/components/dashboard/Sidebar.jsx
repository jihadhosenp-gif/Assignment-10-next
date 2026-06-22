"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-zinc-950 border-r border-zinc-800">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-2xl font-bold text-white">
          SkillSwap
        </h2>
      </div>

      <nav className="p-4 space-y-2">
        <Link
          href="/dashboard/client"
          className="block p-3 rounded-xl hover:bg-zinc-800"
        >
          Dashboard
        </Link>

        <Link
          href="/dashboard/client/post-task"
          className="block p-3 rounded-xl hover:bg-zinc-800"
        >
          Post Task
        </Link>

        <Link
          href="/dashboard/client/my-tasks"
          className="block p-3 rounded-xl hover:bg-zinc-800"
        >
          My Tasks
        </Link>

        <Link
          href="/dashboard/client/proposals"
          className="block p-3 rounded-xl hover:bg-zinc-800"
        >
          Proposals
        </Link>

        <Link
          href="/dashboard/client/payments"
          className="block p-3 rounded-xl hover:bg-zinc-800"
        >
          Payments
        </Link>
      </nav>
    </aside>
  );
}