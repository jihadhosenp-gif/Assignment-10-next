"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  Briefcase,
  CheckCircle2,
  Clock,
  Circle,
} from "lucide-react";

// তোমার Auth Context / Hook থেকে user আনো
// import { useAuth } from "@/providers/AuthProvider";

const STATUS_STYLES = {
  Open: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  "In Progress": {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  Completed: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    dot: "bg-sky-400",
  },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Open;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Example user
  // const { user } = useAuth();

  const user = {
    email: "client@gmail.com",
  };

  useEffect(() => {
    if (user?.email) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/my-tasks/${user.email}`
      );

      setTasks(res.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/tasks/${id}`
      );

      setTasks((prev) =>
        prev.filter((task) => task._id !== id)
      );
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-white">
        Loading Tasks...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Briefcase size={22} />
          <h1 className="text-3xl font-bold">
            My Tasks
          </h1>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Budget</th>
                <th className="text-left p-4">Deadline</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-zinc-400"
                  >
                    No Tasks Found
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="border-b border-zinc-800 hover:bg-zinc-800/40"
                  >
                    <td className="p-4">
                      {task.title}
                    </td>

                    <td className="p-4">
                      {task.category}
                    </td>

                    <td className="p-4 text-emerald-400 font-semibold">
                      ${task.budget}
                    </td>

                    <td className="p-4">
                      {new Date(
                        task.deadline
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <StatusBadge
                        status={task.status}
                      />
                    </td>

                    <td className="p-4 flex gap-2">
                      <button className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(task._id)
                        }
                        className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}