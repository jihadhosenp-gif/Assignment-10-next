"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    openTasks: 0,
    inProgress: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard-stats")
      .then((res) => setStats(res.data))
      .catch((error) =>
        console.error("API Error:", error)
      );
  }, []);

  return (
    <div className="grid md:grid-cols-4 gap-5">
      <div className="bg-zinc-900 p-6 rounded-3xl">
        <h3>Total Tasks</h3>
        <p>{stats.totalTasks}</p>
      </div>

      <div className="bg-zinc-900 p-6 rounded-3xl">
        <h3>Open Tasks</h3>
        <p>{stats.openTasks}</p>
      </div>

      <div className="bg-zinc-900 p-6 rounded-3xl">
        <h3>In Progress</h3>
        <p>{stats.inProgress}</p>
      </div>

      <div className="bg-zinc-900 p-6 rounded-3xl">
        <h3>Total Spent</h3>
        <p>${stats.totalSpent}</p>
      </div>
    </div>
  );
}