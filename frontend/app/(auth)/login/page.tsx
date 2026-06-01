"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Wifi,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please provide both email and password");
      return false;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please provide a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      toast.success("Login successful! Redirecting...");

      // Store token and user data
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      setSuccess(true);

      // Role-based redirect after 1 second
      setTimeout(() => {
        const userRole = data.data.user.role;

        switch (userRole) {
          case "admin":
            router.push("/admin-dashboard");
            break;
          case "recruiter":
            router.push("/recruiter-dashboard");
            break;
          case "professional":
          default:
            router.push("/professional-dashboard");
            break;
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 max-w-md w-full"
      >
        {/* Logo & Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 mb-6 group"
          >
            <div className="relative">
              <Wifi className="w-12 h-12 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <div className="absolute -inset-2 bg-cyan-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              TelecomNet Ghana
            </span>
          </Link>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-400">Sign in to access your dashboard</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
        >
          {success ? (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Login Successful!
              </h3>
              <p className="text-slate-400 mb-4">
                Redirecting to your dashboard...
              </p>
              <div className="inline-flex items-center gap-2 text-cyan-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Please wait...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3"
                >
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-white"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 bg-slate-900/50 border-slate-700 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-slate-400"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all hover:shadow-2xl hover:shadow-cyan-500/50 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Register Link */}
              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-slate-400">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
