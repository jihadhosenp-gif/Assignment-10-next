"use client";

import { useState } from "react";
import { PlusCircle, DollarSign, CalendarDays } from "lucide-react";
import axios from "axios";

export default function PostTaskForm() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    budget: "",
    deadline: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/tasks", {
        ...formData,
        status: "Open",
      });

      alert("Task Published Successfully!");

      setFormData({
        title: "",
        category: "",
        description: "",
        budget: "",
        deadline: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to publish task");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600">
            <PlusCircle size={32} />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white">
              Post a New Task
            </h2>

            <p className="text-zinc-400 mt-1">
              Fill in the details below to publish your task
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Row 1 */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 text-sm text-zinc-300">
                Task Title
              </label>

              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-300">
                Category
              </label>

              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 outline-none focus:border-purple-500"
              >
                <option value="">
                  Select Category
                </option>

                <option>
                  Web Development
                </option>

                <option>
                  UI/UX Design
                </option>

                <option>
                  Graphic Design
                </option>

                <option>
                  Video Editing
                </option>

                <option>
                  Digital Marketing
                </option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm text-zinc-300">
              Description
            </label>

            <textarea
              rows="6"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your task in detail..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 outline-none resize-none focus:border-purple-500"
            />
          </div>

          {/* Budget + Deadline */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 text-sm text-zinc-300">
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
                  placeholder="Enter budget"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-11 outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-300">
                Deadline Date
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 pl-11 outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
            <p className="text-blue-300 text-sm">
              Your task will be visible to freelancers after publishing.
            </p>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 hover:scale-[1.02] transition-all duration-300"
          >
            Publish Task
          </button>
        </form>
      </div>
    </div>
  );
}