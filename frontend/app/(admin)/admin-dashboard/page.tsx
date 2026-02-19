"use client";

import { useEffect, useState } from "react";
import { usersApi, jobsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserCog, Briefcase } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    professionals: 0,
    recruiters: 0,
    jobs: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, professionalsRes, recruitersRes, jobsRes] =
        await Promise.all([
          usersApi.getAllUsers(),
          usersApi.getAllProfessionals(),
          usersApi.getAllRecruiters(),
          jobsApi.getAllJobs(),
        ]);

      setStats({
        totalUsers: usersRes.success ? usersRes.count : 0,
        professionals: professionalsRes.success ? professionalsRes.count : 0,
        recruiters: recruitersRes.success ? recruitersRes.count : 0,
        jobs: jobsRes.success ? jobsRes.count : 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-500/20 to-blue-500/20",
      borderColor: "border-cyan-500/30",
    },
    {
      title: "Professionals",
      value: stats.professionals,
      icon: UserCheck,
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-500/20 to-blue-500/20",
      borderColor: "border-cyan-500/30",
    },
    {
      title: "Recruiters",
      value: stats.recruiters,
      icon: UserCog,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
    },
    {
      title: "Job Posts",
      value: stats.jobs,
      icon: Briefcase,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-500/20 to-red-500/20",
      borderColor: "border-orange-500/30",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to Admin Dashboard
        </h1>
        <p className="text-slate-400 text-lg">
          Manage your TelecomNet Ghana platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                {stat.title}
              </CardTitle>
              <div
                className={`p-2 rounded-lg bg-linear-to-br ${stat.bgGradient} border ${stat.borderColor}`}
              >
                <stat.icon
                  className={`h-4 w-4 text-${stat.gradient.split(" ")[0].replace("from-", "")}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-slate-400 mt-1">
                Total {stat.title.toLowerCase()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/admin-dashboard/users"
              className="p-4 rounded-lg border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all duration-200 group"
            >
              <Users className="h-8 w-8 text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">Manage Users</h3>
              <p className="text-sm text-slate-400">
                View and manage all users
              </p>
            </a>
            <a
              href="/admin-dashboard/professionals"
              className="p-4 rounded-lg border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all duration-200 group"
            >
              <UserCheck className="h-8 w-8 text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">Professionals</h3>
              <p className="text-sm text-slate-400">
                Manage professional accounts
              </p>
            </a>
            <a
              href="/admin-dashboard/recruiters"
              className="p-4 rounded-lg border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/50 transition-all duration-200 group"
            >
              <UserCog className="h-8 w-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">Recruiters</h3>
              <p className="text-sm text-slate-400">
                Manage recruiter accounts
              </p>
            </a>
            <a
              href="/admin-dashboard/jobs"
              className="p-4 rounded-lg border border-slate-800 hover:border-orange-500/50 hover:bg-slate-800/50 transition-all duration-200 group"
            >
              <Briefcase className="h-8 w-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">Job Posts</h3>
              <p className="text-sm text-slate-400">Manage all job postings</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
