"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wifi, Loader2, CheckCircle2, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";
const OTP_LENGTH = 6;

const VerifyOtpPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingVerificationEmail");
    if (!pending) {
      router.replace("/login");
      return;
    }
    setEmail(pending);
    inputsRef.current[0]?.focus();
  }, [router]);

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    setError("");

    if (clean.length > 1) {
      // Handle paste of the full code
      const next = Array(OTP_LENGTH).fill("");
      clean
        .slice(0, OTP_LENGTH)
        .split("")
        .forEach((d, i) => (next[i] = d));
      setDigits(next);
      inputsRef.current[Math.min(clean.length, OTP_LENGTH) - 1]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = clean;
    setDigits(next);

    if (clean && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const otp = digits.join("");

    if (otp.length !== OTP_LENGTH) {
      setError("Please enter the 6-digit code sent to your email.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      sessionStorage.removeItem("pendingVerificationEmail");

      setSuccess(true);
      toast.success("Verification successful! Redirecting...");

      setTimeout(() => {
        switch (data.data.user.role) {
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
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    try {
      const response = await fetch(`${API}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to resend code");
      toast.success("A new verification code has been sent to your email.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 mb-6 group"
          >
            <Wifi className="w-12 h-12 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              TelecomNet Ghana
            </span>
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/10 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Verify Your Identity
          </h2>
          <p className="text-slate-400 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Enter the 6-digit code sent to{" "}
            <span className="text-cyan-400 font-medium">{email}</span>
          </p>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
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
                Verified Successfully!
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

              <div className="flex justify-center gap-2 sm:gap-3">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={OTP_LENGTH}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all hover:shadow-2xl hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>

              <div className="text-center pt-4 border-t border-slate-700 space-y-2">
                <p className="text-slate-400 text-sm">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold disabled:opacity-50"
                  >
                    {isResending ? "Sending..." : "Resend Code"}
                  </button>
                </p>
                <p className="text-slate-500 text-sm">
                  <Link
                    href="/login"
                    className="text-slate-400 hover:text-cyan-300"
                  >
                    Back to login
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;
