"use client";

import { useState } from "react";
import axios from "axios";
import {
PlusCircle,
DollarSign,
CalendarDays,
Briefcase,
FileText,
} from "lucide-react";

export default function PostTaskForm() {
const [loading, setLoading] = useState(false);

const [formData, setFormData] = useState({
title: "",
category: "",
description: "",
budget: "",
deadline: "",
});

const handleChange = (e) => {
setFormData((prev) => ({
...prev,
[e.target.name]: e.target.value,
}));
};

const handleSubmit = async (e) => {
e.preventDefault();


try {
  setLoading(true);

  const response = await axios.post(
    "http://localhost:5000/api/tasks",
    {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      budget: Number(formData.budget),
      deadline: formData.deadline,
      status: "Open",
      createdAt: new Date(),
    }
  );

  console.log(response.data);

  alert("Task Published Successfully!");

  setFormData({
    title: "",
    category: "",
    description: "",
    budget: "",
    deadline: "",
  });
} catch (error) {
  console.error("Publish Error:", error);
  alert("Failed to Publish Task");
} finally {
  setLoading(false);
}

};

return ( <div className="max-w-5xl mx-auto"> <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">

    <div className="flex items-center gap-4 mb-8">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl">
        <PlusCircle size={32} className="text-white" />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white">
          Post New Task
        </h2>

        <p className="text-zinc-400">
          Publish a task and hire talented freelancers
        </p>
      </div>
    </div>

    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm text-zinc-300 mb-2 block">
            Task Title
          </label>

          <div className="relative">
            <Briefcase
              size={18}
              className="absolute left-4 top-4 text-zinc-500"
            />

            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Build a React Dashboard"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-11 outline-none focus:border-purple-500 text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-zinc-300 mb-2 block">
            Category
          </label>

          <select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 outline-none focus:border-purple-500 text-white"
          >
            <option value="">
              Select Category
            </option>

            <option value="Web Development">
              Web Development
            </option>

            <option value="UI/UX Design">
              UI/UX Design
            </option>

            <option value="Graphic Design">
              Graphic Design
            </option>

            <option value="Video Editing">
              Video Editing
            </option>

            <option value="Digital Marketing">
              Digital Marketing
            </option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-300 mb-2 block">
          Description
        </label>

        <div className="relative">
          <FileText
            size={18}
            className="absolute left-4 top-4 text-zinc-500"
          />

          <textarea
            rows={6}
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your task requirements..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-11 outline-none resize-none focus:border-purple-500 text-white"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm text-zinc-300 mb-2 block">
            Budget (USD)
          </label>

          <div className="relative">
            <DollarSign
              size={18}
              className="absolute left-4 top-4 text-zinc-500"
            />

            <input
              type="number"
              name="budget"
              required
              value={formData.budget}
              onChange={handleChange}
              placeholder="500"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-11 outline-none focus:border-purple-500 text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-zinc-300 mb-2 block">
            Deadline
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="absolute left-4 top-4 text-zinc-500"
            />

            <input
              type="date"
              name="deadline"
              required
              value={formData.deadline}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-11 outline-none focus:border-purple-500 text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
        <p className="text-blue-300 text-sm">
          After publishing, freelancers can submit proposals for this task.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 text-white"
      >
        {loading ? "Publishing..." : "Publish Task"}
      </button>
    </form>
  </div>
</div>


);
}
