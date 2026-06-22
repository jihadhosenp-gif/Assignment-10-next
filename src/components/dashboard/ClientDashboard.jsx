"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  DollarSign,
  Settings,
  Menu,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Edit,
} from "lucide-react";

export default function ClientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Landing Page Design",
      category: "UI/UX Design",
      budget: 200,
      deadline: "2026-07-15",
      status: "Open",
    },
    {
      id: 2,
      title: "React Dashboard",
      category: "Web Development",
      budget: 500,
      deadline: "2026-08-01",
      status: "In Progress",
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    budget: "",
    deadline: "",
  });

  const proposals = [
    {
      id: 1,
      freelancer: "John Doe",
      budget: 180,
      days: 5,
      message: "I can complete this project quickly.",
      status: "Pending",
    },
    {
      id: 2,
      freelancer: "Sarah Smith",
      budget: 170,
      days: 4,
      message: "Experienced UI Designer.",
      status: "Pending",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTask = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      budget: formData.budget,
      deadline: formData.deadline,
      status: "Open",
    };

    setTasks([...tasks, newTask]);

    setFormData({
      title: "",
      category: "",
      description: "",
      budget: "",
      deadline: "",
    });
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 h-full w-72 bg-zinc-950 border-r border-zinc-800 transition-all ${
          sidebarOpen ? "left-0" : "-left-72"
        } lg:left-0`}
      >
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-2xl font-bold">
            SkillSwap
          </h2>
        </div>

        <nav className="p-4 space-y-2">
          <SidebarItem
            icon={LayoutDashboard}
            text="Dashboard"
          />
          <SidebarItem
            icon={Plus}
            text="Post Task"
          />
          <SidebarItem
            icon={FileText}
            text="My Tasks"
          />
          <SidebarItem
            icon={Users}
            text="Manage Proposals"
          />
          <SidebarItem
            icon={DollarSign}
            text="Payments"
          />
          <SidebarItem
            icon={Settings}
            text="Settings"
          />
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Topbar */}
        <header className="sticky top-0 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 p-4 flex items-center justify-between">
          <button
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            className="lg:hidden"
          >
            <Menu />
          </button>

          <h1 className="font-bold text-xl">
            Client Dashboard
          </h1>

          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600" />
        </header>

        <div className="p-6 space-y-8">
          {/* Stats */}
          <section>
            <h2 className="text-xl font-bold mb-4">
              Overview
            </h2>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard
                title="Total Tasks"
                value="24"
                icon={Briefcase}
              />
              <StatCard
                title="Open Tasks"
                value="8"
                icon={Clock}
              />
              <StatCard
                title="In Progress"
                value="10"
                icon={CheckCircle2}
              />
              <StatCard
                title="Total Spent"
                value="$4,520"
                icon={DollarSign}
              />
            </div>
          </section>

          {/* Post Task */}
          <section className="bg-zinc-900 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-5">
              Post a New Task
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-2 gap-4"
            >
              <input
                placeholder="Task Title"
                className="bg-zinc-800 p-3 rounded-xl"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
              />

              <select
                className="bg-zinc-800 p-3 rounded-xl"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
              >
                <option>
                  Select Category
                </option>
                <option>
                  Web Development
                </option>
                <option>UI/UX Design</option>
                <option>
                  Graphic Design
                </option>
                <option>
                  Video Editing
                </option>
              </select>

              <textarea
                placeholder="Description"
                className="bg-zinc-800 p-3 rounded-xl md:col-span-2"
                rows="4"
              />

              <input
                type="number"
                placeholder="Budget"
                className="bg-zinc-800 p-3 rounded-xl"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: e.target.value,
                  })
                }
              />

              <input
                type="date"
                className="bg-zinc-800 p-3 rounded-xl"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deadline: e.target.value,
                  })
                }
              />

              <button
                type="submit"
                className="md:col-span-2 bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl font-semibold"
              >
                Publish Task
              </button>
            </form>
          </section>

          {/* My Tasks */}
          <section className="bg-zinc-900 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-5">
              My Tasks
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th>Title</th>
                    <th>Category</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b border-zinc-800"
                    >
                      <td>{task.title}</td>
                      <td>{task.category}</td>
                      <td>${task.budget}</td>
                      <td>{task.status}</td>

                      <td>
                        <div className="flex gap-2">
                          <button>
                            <Edit size={18} />
                          </button>

                          <button
                            onClick={() =>
                              deleteTask(task.id)
                            }
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Proposals */}
          <section className="bg-zinc-900 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-5">
              Manage Proposals
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="border border-zinc-800 rounded-2xl p-5"
                >
                  <h3 className="font-bold text-lg">
                    {proposal.freelancer}
                  </h3>

                  <p>
                    Budget: $
                    {proposal.budget}
                  </p>

                  <p>
                    Completion Days:
                    {proposal.days}
                  </p>

                  <p className="text-zinc-400 mt-2">
                    {proposal.message}
                  </p>

                  <div className="flex gap-3 mt-4">
                    <button className="bg-green-600 px-4 py-2 rounded-lg">
                      Accept
                    </button>

                    <button className="bg-red-600 px-4 py-2 rounded-lg">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  text,
}) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition">
      <Icon size={20} />
      {text}
    </button>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-zinc-800 rounded-3xl p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-zinc-400">
            {title}
          </p>
          <h3 className="text-3xl font-bold mt-2">
            {value}
          </h3>
        </div>

        <div className="bg-zinc-800 p-3 rounded-xl">
          <Icon />
        </div>
      </div>
    </div>
  );
}