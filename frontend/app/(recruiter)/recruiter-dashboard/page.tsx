"use client";

import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, Briefcase, FileText, TrendingUp, CheckCircle,
  XCircle, HourglassIcon, ArrowRight, Loader2, Activity,
  ClipboardList, UserCheck,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecruiterData {
  totals: {
    jobs: number;
    applications: number;
    pending: number;
    shortlisted: number;
    hired: number;
  };
  appPerJob: { title: string; fullTitle: string; applications: number }[];
  pipeline: { status: string; count: number }[];
  applicationGrowth: { month: string; count: number }[];
  jobsByStatus: { status: string; count: number }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b", Reviewing: "#3b82f6", Shortlisted: "#8b5cf6",
  Hired: "#10b981", Rejected: "#ef4444", Active: "#06b6d4", Closed: "#64748b",
};
const PIE_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444", "#06b6d4"];

// ─── Tooltip ─────────────────────────────────────────────────────────────────

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-sm">
      {label && <p className="text-slate-400 mb-1 font-medium">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-semibold">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecruiterDashboardPage() {
  const [data, setData] = useState<RecruiterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setCurrentUser(JSON.parse(userData));
    analyticsApi.getRecruiterAnalytics().then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
          <p className="text-slate-400 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">Failed to load analytics.</p>
      </div>
    );
  }

  const conversionRate = data.totals.applications > 0
    ? Math.round((data.totals.hired / data.totals.applications) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-linear-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {currentUser?.name?.split(" ")[0] ?? "Recruiter"}! 👋
            </h1>
            <p className="text-slate-400">Your recruiting dashboard — track jobs, candidates, and pipeline health</p>
          </div>
          <Activity className="h-12 w-12 text-cyan-500 opacity-50" />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          { title: "Active Jobs", value: data.totals.jobs, icon: Briefcase, color: "text-cyan-400", bg: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30" },
          { title: "Total Applications", value: data.totals.applications, icon: FileText, color: "text-blue-400", bg: "from-blue-500/20 to-indigo-500/20", border: "border-blue-500/30" },
          { title: "Pending Review", value: data.totals.pending, icon: HourglassIcon, color: "text-yellow-400", bg: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/30" },
          { title: "Shortlisted", value: data.totals.shortlisted, icon: UserCheck, color: "text-purple-400", bg: "from-purple-500/20 to-violet-500/20", border: "border-purple-500/30" },
          { title: "Hired", value: data.totals.hired, icon: CheckCircle, color: "text-green-400", bg: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30" },
        ].map((stat) => (
          <Card key={stat.title} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-slate-300">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-linear-to-br ${stat.bg} border ${stat.border}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hire Rate Banner */}
      <div className="bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-green-400" />
          <div>
            <p className="text-white font-semibold">Hire Conversion Rate</p>
            <p className="text-slate-400 text-sm">Hired candidates out of total applicants</p>
          </div>
        </div>
        <div className="text-4xl font-bold text-green-400">{conversionRate}%</div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Applications per Job */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-cyan-400" />
              Applications per Job
            </CardTitle>
            <CardDescription className="text-slate-400">How many candidates applied to each listing</CardDescription>
          </CardHeader>
          <CardContent>
            {data.appPerJob.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-3">
                <Briefcase className="h-10 w-10 opacity-30" />
                <p>No jobs posted yet</p>
                <Link href="/recruiter-dashboard/jobs">
                  <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">Post a Job</Button>
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.appPerJob} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="title" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="applications" name="Applications" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Candidate Pipeline Pie */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Candidate Pipeline
            </CardTitle>
            <CardDescription className="text-slate-400">Application status distribution across all jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {data.pipeline.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-500">No applications yet</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={data.pipeline} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                      {data.pipeline.map((entry, i) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 flex-1">
                  {data.pipeline.map((item, i) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.status] || PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-300 text-sm">{item.status}</span>
                      </div>
                      <Badge className="bg-slate-700 text-white border-0">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Applications Trend */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Application Inflow (Last 6 Months)
            </CardTitle>
            <CardDescription className="text-slate-400">Monthly volume of incoming applications</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.applicationGrowth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Line type="monotone" dataKey="count" name="Applications" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Jobs by Status */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-orange-400" />
              Jobs by Status
            </CardTitle>
            <CardDescription className="text-slate-400">Breakdown of your posted job listings</CardDescription>
          </CardHeader>
          <CardContent>
            {data.jobsByStatus.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-500">No jobs data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.jobsByStatus} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="status" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="count" name="Jobs" radius={[4, 4, 0, 0]}>
                    {data.jobsByStatus.map((entry, i) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/recruiter-dashboard/professionals" className="p-4 rounded-lg border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all duration-200 group">
              <UserCheck className="h-8 w-8 text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">Browse Professionals</h3>
              <p className="text-sm text-slate-400">Find and connect with talent</p>
            </Link>
            <Link href="/recruiter-dashboard/jobs" className="p-4 rounded-lg border border-slate-800 hover:border-orange-500/50 hover:bg-slate-800/50 transition-all duration-200 group">
              <Briefcase className="h-8 w-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">Manage Jobs</h3>
              <p className="text-sm text-slate-400">Post and manage job listings</p>
            </Link>
            <Link href="/recruiter-dashboard/connections" className="p-4 rounded-lg border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/50 transition-all duration-200 group">
              <Users className="h-8 w-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">My Network</h3>
              <p className="text-sm text-slate-400">View your connections</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
