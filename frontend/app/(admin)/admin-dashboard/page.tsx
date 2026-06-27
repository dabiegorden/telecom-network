"use client";

import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, UserCheck, UserCog, Briefcase, Activity, TrendingUp,
  MessageSquare, Download, FileText, Link2, Loader2,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformData {
  totals: {
    users: number;
    professionals: number;
    recruiters: number;
    jobs: number;
    applications: number;
    posts: number;
    connections: number;
  };
  activityByMonth: { month: string; users: number; jobs: number; applications: number; posts: number }[];
  applicationsByStatus: { status: string; count: number }[];
  postsByCategory: { category: string; count: number }[];
  userGrowth: { month: string; count: number }[];
  jobGrowth: { month: string; count: number }[];
  roleDist: { role: string; count: number }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PIE_COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];
const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Reviewing: "#3b82f6",
  Shortlisted: "#8b5cf6",
  Hired: "#10b981",
  Rejected: "#ef4444",
};

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportCSV(data: PlatformData) {
  const sections: string[] = [];

  sections.push("TELECOMNET GHANA — PLATFORM REPORT");
  sections.push(`Generated: ${new Date().toLocaleString()}`);
  sections.push("");

  sections.push("== PLATFORM TOTALS ==");
  sections.push("Metric,Value");
  Object.entries(data.totals).forEach(([k, v]) =>
    sections.push(`${k.charAt(0).toUpperCase() + k.slice(1)},${v}`)
  );
  sections.push("");

  sections.push("== MONTHLY ACTIVITY ==");
  sections.push("Month,New Users,New Jobs,Applications,Posts");
  data.activityByMonth.forEach((r) =>
    sections.push(`${r.month},${r.users},${r.jobs},${r.applications},${r.posts}`)
  );
  sections.push("");

  sections.push("== APPLICATION STATUS BREAKDOWN ==");
  sections.push("Status,Count");
  data.applicationsByStatus.forEach((r) => sections.push(`${r.status},${r.count}`));
  sections.push("");

  sections.push("== POSTS BY CATEGORY ==");
  sections.push("Category,Count");
  data.postsByCategory.forEach((r) => sections.push(`${r.category},${r.count}`));

  const blob = new Blob([sections.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `telecomnet-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

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

export default function AdminDashboardPage() {
  const [data, setData] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getPlatformAnalytics().then((res) => {
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
        <p className="text-slate-400">Failed to load analytics data.</p>
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: data.totals.users, icon: Users, color: "text-cyan-400", bg: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30" },
    { title: "Professionals", value: data.totals.professionals, icon: UserCheck, color: "text-blue-400", bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
    { title: "Recruiters", value: data.totals.recruiters, icon: UserCog, color: "text-purple-400", bg: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30" },
    { title: "Job Posts", value: data.totals.jobs, icon: Briefcase, color: "text-orange-400", bg: "from-orange-500/20 to-red-500/20", border: "border-orange-500/30" },
    { title: "Applications", value: data.totals.applications, icon: FileText, color: "text-green-400", bg: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30" },
    { title: "Community Posts", value: data.totals.posts, icon: MessageSquare, color: "text-pink-400", bg: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30" },
    { title: "Connections", value: data.totals.connections, icon: Link2, color: "text-yellow-400", bg: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/30" },
    { title: "Platform Activity", value: data.activityByMonth.reduce((s, m) => s + m.users + m.jobs + m.applications, 0), icon: Activity, color: "text-indigo-400", bg: "from-indigo-500/20 to-violet-500/20", border: "border-indigo-500/30" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Analytics</h1>
          <p className="text-slate-400 text-lg">Platform-wide insights for TelecomNet Ghana</p>
        </div>
        <Button
          onClick={() => exportCSV(data)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">{stat.title}</CardTitle>
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

      {/* Platform Activity — Area Chart */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            Platform Activity (Last 6 Months)
          </CardTitle>
          <CardDescription className="text-slate-400">New users, jobs, applications and posts per month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.activityByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Area type="monotone" dataKey="users" name="Users" stroke="#06b6d4" fill="url(#colorUsers)" strokeWidth={2} />
              <Area type="monotone" dataKey="jobs" name="Jobs" stroke="#8b5cf6" fill="url(#colorJobs)" strokeWidth={2} />
              <Area type="monotone" dataKey="applications" name="Applications" stroke="#10b981" fill="url(#colorApps)" strokeWidth={2} />
              <Area type="monotone" dataKey="posts" name="Posts" stroke="#f59e0b" fill="url(#colorPosts)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Application Status Pie */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-400" />
              Application Status Breakdown
            </CardTitle>
            <CardDescription className="text-slate-400">Distribution across all candidate applications</CardDescription>
          </CardHeader>
          <CardContent>
            {data.applicationsByStatus.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-500">No application data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.applicationsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(data.applicationsByStatus || []).map((entry, index) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Posts by Category */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-pink-400" />
              Community Posts by Category
            </CardTitle>
            <CardDescription className="text-slate-400">Total posts per telecom topic</CardDescription>
          </CardHeader>
          <CardContent>
            {data.postsByCategory.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-500">No post data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.postsByCategory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="count" name="Posts" radius={[4, 4, 0, 0]}>
                    {(data.postsByCategory || []).map((entry, index) => (
                      <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* User Growth Line Chart */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              User Registrations (Last 6 Months)
            </CardTitle>
            <CardDescription className="text-slate-400">New user sign-ups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.userGrowth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Line type="monotone" dataKey="count" name="New Users" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: "#06b6d4", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Postings Bar Chart */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-orange-400" />
              Job Postings (Last 6 Months)
            </CardTitle>
            <CardDescription className="text-slate-400">New job listings posted per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.jobGrowth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="count" name="Job Posts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Role Distribution */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserCog className="h-5 w-5 text-purple-400" />
            User Role Distribution
          </CardTitle>
          <CardDescription className="text-slate-400">Breakdown of registered user roles on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={data.roleDist} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={4}>
                  {(data.roleDist || []).map((entry, index) => (
                    <Cell key={entry.role} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 flex-1">
              {(data.roleDist || []).map((item, index) => (
                <div key={item.role} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="text-slate-300 font-medium">{item.role}</span>
                  </div>
                  <Badge className="bg-slate-700 text-white border-0 text-base font-bold px-3">{item.count}</Badge>
                </div>
              ))}
              <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700 mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-500" />
                  <span className="text-slate-300 font-medium">Total Users</span>
                </div>
                <Badge className="bg-cyan-600 text-white border-0 text-base font-bold px-3">{data.totals.users}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/admin-dashboard/users", icon: Users, color: "text-cyan-500", hoverBorder: "hover:border-cyan-500/50", title: "Manage Users", desc: "View and manage all users" },
              { href: "/admin-dashboard/professionals", icon: UserCheck, color: "text-cyan-500", hoverBorder: "hover:border-cyan-500/50", title: "Professionals", desc: "Manage professional accounts" },
              { href: "/admin-dashboard/recruiters", icon: UserCog, color: "text-purple-500", hoverBorder: "hover:border-purple-500/50", title: "Recruiters", desc: "Manage recruiter accounts" },
              { href: "/admin-dashboard/jobs", icon: Briefcase, color: "text-orange-500", hoverBorder: "hover:border-orange-500/50", title: "Job Posts", desc: "Manage all job postings" },
            ].map((action) => (
              <a key={action.href} href={action.href} className={`p-4 rounded-lg border border-slate-800 ${action.hoverBorder} hover:bg-slate-800/50 transition-all duration-200 group`}>
                <action.icon className={`h-8 w-8 ${action.color} mb-3 group-hover:scale-110 transition-transform`} />
                <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                <p className="text-sm text-slate-400">{action.desc}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
