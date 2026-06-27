"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { analyticsApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  MessageSquare,
  TrendingUp,
  Eye,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  HourglassIcon,
  Users,
  BookOpen,
  Send,
  ArrowRight,
  Activity,
  Loader2,
  Calendar,
  MapPin,
  Building2,
  Link2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totals: {
    applications: number;
    myPosts: number;
    connections: number;
    totalLikes: number;
    totalViews: number;
  };
  applicationsByStatus: { status: string; count: number }[];
  applicationGrowth: { month: string; count: number }[];
  postEngagement: {
    title: string;
    likes: number;
    comments: number;
    views: number;
  }[];
  connectionGrowth: { month: string; count: number }[];
}

interface RecentPost {
  _id: string;
  title: string;
  category: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
}
interface RecentApplication {
  _id: string;
  job: { _id: string; title: string; company: string; location: string };
  status: string;
  appliedAt: string;
}
interface RecentResource {
  _id: string;
  title: string;
  fileType: string;
  uploadedBy: { name: string };
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Reviewing: "#3b82f6",
  Shortlisted: "#8b5cf6",
  Hired: "#10b981",
  Rejected: "#ef4444",
  Accepted: "#10b981",
};
const PIE_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];

// ─── Helper ───────────────────────────────────────────────────────────────────

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

const ProfessionalDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [recentApplications, setRecentApplications] = useState<
    RecentApplication[]
  >([]);
  const [recentResources, setRecentResources] = useState<RecentResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setCurrentUser(JSON.parse(userData));
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, postsRes, resourcesRes, applicationsRes] =
        await Promise.all([
          analyticsApi.getProfessionalAnalytics(),
          fetch(`${API}/posts?limit=5&sort=newest`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${API}/resources?limit=5`, { headers }).then((r) => r.json()),
          fetch(`${API}/applications/my-applications`, { headers }).then((r) =>
            r.json(),
          ),
        ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);

      if (postsRes.success) setRecentPosts((postsRes.data || []).slice(0, 5));
      if (resourcesRes.success)
        setRecentResources((resourcesRes.data || []).slice(0, 5));
      if (applicationsRes.success)
        setRecentApplications((applicationsRes.data || []).slice(0, 5));
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Network: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      Fiber: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "5G": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Certifications: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      General: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return colors[category] || colors.General;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      accepted: "bg-green-500/10 text-green-400 border-green-500/20",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20",
      shortlisted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "shortlisted":
        return <Users className="h-4 w-4" />;
      default:
        return <HourglassIcon className="h-4 w-4" />;
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    const icons: Record<string, string> = {
      pdf: "📄",
      document: "📝",
      spreadsheet: "📊",
      image: "🖼️",
    };
    return icons[fileType] || "📎";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
          <p className="text-slate-400 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totals = analytics?.totals;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {currentUser?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-400">
              Here's your TelecomNet activity at a glance
            </p>
          </div>
          <Activity className="h-12 w-12 text-cyan-500 opacity-50" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Applications",
            value: totals?.applications ?? 0,
            icon: Briefcase,
            color: "text-cyan-500",
          },
          {
            label: "My Posts",
            value: totals?.myPosts ?? 0,
            icon: MessageSquare,
            color: "text-blue-500",
          },
          {
            label: "Connections",
            value: totals?.connections ?? 0,
            icon: Link2,
            color: "text-purple-500",
          },
          {
            label: "Total Likes",
            value: totals?.totalLikes ?? 0,
            icon: Heart,
            color: "text-pink-500",
          },
          {
            label: "Total Views",
            value: totals?.totalViews ?? 0,
            icon: Eye,
            color: "text-orange-500",
          },
        ].map((s) => (
          <Card
            key={s.label}
            className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/30 transition-all"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-slate-400">
                  {s.label}
                </CardTitle>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Donut */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-400" />
              Application Status
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your job application pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analytics?.applicationsByStatus?.length ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-3">
                <Send className="h-10 w-10 opacity-30" />
                <p>No applications yet</p>
                <Link href="/professional-dashboard/jobs">
                  <Button
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={analytics.applicationsByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {analytics.applicationsByStatus.map((entry, i) => (
                        <Cell
                          key={entry.status}
                          fill={
                            STATUS_COLORS[entry.status] ||
                            PIE_COLORS[i % PIE_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 flex-1">
                  {analytics.applicationsByStatus.map((item, i) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[item.status] ||
                              PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-slate-300 text-sm">
                          {item.status}
                        </span>
                      </div>
                      <span className="text-white font-bold text-sm">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Trend Line */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Application Activity
            </CardTitle>
            <CardDescription className="text-slate-400">
              Monthly job applications over last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={analytics?.applicationGrowth || []}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<DarkTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Applications"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ fill: "#06b6d4", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Post Engagement Bar */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              Post Engagement
            </CardTitle>
            <CardDescription className="text-slate-400">
              Likes, comments & views on your top posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analytics?.postEngagement?.length ? (
              <div className="flex items-center justify-center h-48 text-slate-500">
                No posts yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={analytics.postEngagement}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="title"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
                  <Bar
                    dataKey="likes"
                    name="Likes"
                    fill="#ec4899"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="comments"
                    name="Comments"
                    fill="#3b82f6"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="views"
                    name="Views"
                    fill="#f59e0b"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Connection Growth */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Link2 className="h-5 w-5 text-purple-400" />
              Network Growth
            </CardTitle>
            <CardDescription className="text-slate-400">
              New connections added per month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={analytics?.connectionGrowth || []}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<DarkTooltip />} />
                <Bar
                  dataKey="count"
                  name="Connections"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  Recent Applications
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your latest job applications
                </CardDescription>
              </div>
              <Link href="/professional-dashboard/jobs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700"
                >
                  Browse Jobs <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Send className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No applications yet</p>
                <Link href="/professional-dashboard/jobs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {app.job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{app.job.company}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {app?.job?.location}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        Applied{" "}
                        {app?.appliedAt &&
                        !isNaN(new Date(app.appliedAt).getTime())
                          ? formatDistanceToNow(new Date(app.appliedAt), {
                              addSuffix: true,
                            })
                          : "recently"}
                      </div>
                    </div>
                    <Badge className={getStatusColor(app?.status)}>
                      <span className="mr-1">{getStatusIcon(app?.status)}</span>
                      {app?.status
                        ? app?.status.charAt(0).toUpperCase() +
                          app?.status.slice(1)
                        : "Unknown"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  Recent Community Posts
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Latest discussions
                </CardDescription>
              </div>
              <Link href="/professional-dashboard/posts">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700"
                >
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No posts available</p>
              </div>
            ) : (
              recentPosts?.map((post) => (
                <div
                  key={post._id}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-white flex-1 line-clamp-2">
                      {post.title}
                    </h3>
                    <Badge className={getCategoryColor(post?.category)}>
                      {post?.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.likeCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {post.commentCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.viewCount}
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <Clock className="h-3 w-3" />
                      {post?.createdAt &&
                      !isNaN(new Date(post.createdAt).getTime())
                        ? formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })
                        : "recently"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Resources */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Resources</CardTitle>
              <CardDescription className="text-slate-400">
                Latest learning materials
              </CardDescription>
            </div>
            <Link href="/professional-dashboard/resources">
              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700"
              >
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentResources.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No resources available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentResources.map((resource) => (
                <div
                  key={resource._id}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">
                      {getFileTypeIcon(resource.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                        {resource.title}
                      </h3>
                      <p className="text-xs text-slate-400 mb-2">
                        by {resource?.uploadedBy?.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-slate-700/50 text-slate-300 border-slate-600"
                        >
                          {resource.fileType.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {resource?.createdAt &&
                          !isNaN(new Date(resource.createdAt).getTime())
                            ? formatDistanceToNow(new Date(resource.createdAt), {
                                addSuffix: true,
                              })
                            : "recently"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalDashboard;
