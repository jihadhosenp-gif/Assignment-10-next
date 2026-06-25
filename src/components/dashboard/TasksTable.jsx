"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  Briefcase,
  Loader2,
} from "lucide-react";

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
  const [deletingId, setDeletingId] = useState(null);

  // Better Auth থেকে email আনবে
  // const { data: session } = useSession();
  // const email = session?.user?.email;

  const email = "client@gmail.com";

  const fetchTasks = useCallback(async () => {
    if (!email) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/my-tasks/${email}`
      );

      setTasks(res.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await axios.delete(
        `http://localhost:5000/api/tasks/${id}`
      );

      setTasks((prev) =>
        prev.filter((task) => task._id !== id)
      );
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="animate-spin" size={28} />
          <span className="text-lg font-medium">
            Loading Tasks...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-indigo-500/10">
            <Briefcase className="text-indigo-400" size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              My Tasks
            </h1>

            <p className="text-zinc-400 mt-1">
              Manage all your posted tasks.
            </p>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900">
                  <th className="text-left p-5 font-semibold">
                    Title
                  </th>

                  <th className="text-left p-5 font-semibold">
                    Category
                  </th>

                  <th className="text-left p-5 font-semibold">
                    Budget
                  </th>

                  <th className="text-left p-5 font-semibold">
                    Deadline
                  </th>

                  <th className="text-left p-5 font-semibold">
                    Status
                  </th>

                  <th className="text-left p-5 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-20"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Briefcase
                          size={50}
                          className="text-zinc-600"
                        />

                        <h3 className="text-xl font-semibold">
                          No Tasks Found
                        </h3>

                        <p className="text-zinc-400">
                          You haven't posted any task yet.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task._id}
                      className="border-b border-zinc-800 hover:bg-zinc-800/40 transition"
                    >
                      <td className="p-5 font-medium">
                        {task.title}
                      </td>

                      <td className="p-5 text-zinc-300">
                        {task.category}
                      </td>

                      <td className="p-5">
                        <span className="font-semibold text-emerald-400">
                          ${task.budget}
                        </span>
                      </td>

                      <td className="p-5 text-zinc-300">
                        {new Date(
                          task.deadline
                        ).toLocaleDateString()}
                      </td>

                      <td className="p-5">
                        <StatusBadge
                          status={task.status}
                        />
                      </td>

                      <td className="p-5">
                        <div className="flex items-center gap-2">

                          <button
                            className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(task._id)
                            }
                            disabled={
                              deletingId === task._id
                            }
                            className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                          >
                            {deletingId === task._id ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}