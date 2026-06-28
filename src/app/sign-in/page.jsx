"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await authClient.signIn.email({
        email:    formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // ← signin সফল হলেও sync করো (নতুন device বা প্রথমবার login)
      if (data?.user) {
        await fetch(`${SERVER}/api/users/sync`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:  data.user.name,
            email: data.user.email,
            role:  data.user.role || "Freelancer",
          }),
        });
      }

      // Role অনুযায়ী redirect করো
      const role = data?.user?.role?.toLowerCase();
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "client") {
        router.push("/dashboard/client");
      } else if (role === "freelancer") {
        router.push("/dashboard/freelancer");
      } else {
        router.push("/");
      }

    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-white">Welcome Back</h1>
        <p className="text-center text-white/50 mt-2 mb-8">Sign in to your SkillSwap account</p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white/70 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-white/70 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-white/60 mt-6">
          Don't have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-purple-400 hover:text-purple-300 transition">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}