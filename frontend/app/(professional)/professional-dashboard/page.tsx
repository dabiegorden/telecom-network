"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  FileText,
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface DashboardStats {
  totalPosts: number;
  totalResources: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
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
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
  };
  status: string;
  appliedAt: string;
}

interface RecentResource {
  _id: string;
  title: string;
  fileType: string;
  uploadedBy: {
    name: string;
  };
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

const ProfessionalDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalResources: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [recentApplications, setRecentApplications] = useState<
    RecentApplication[]
  >([]);
  const [recentResources, setRecentResources] = useState<RecentResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch all data in parallel
      const [postsRes, resourcesRes, applicationsRes] = await Promise.all([
        fetch(`${API}/posts?limit=5&sort=newest`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/resources?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/applications/my-applications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const postsData = await postsRes.json();
      const resourcesData = await resourcesRes.json();
      const applicationsData = await applicationsRes.json();

      // Calculate stats
      if (postsData.success) {
        setRecentPosts(postsData.data.slice(0, 5));

        // Calculate engagement stats from recent posts
        const totalLikes = postsData.data.reduce(
          (sum: number, post: any) => sum + post.likeCount,
          0,
        );
        const totalComments = postsData.data.reduce(
          (sum: number, post: any) => sum + post.commentCount,
          0,
        );
        const totalViews = postsData.data.reduce(
          (sum: number, post: any) => sum + post.viewCount,
          0,
        );

        setStats((prev) => ({
          ...prev,
          totalPosts: postsData.total || 0,
          totalLikes,
          totalComments,
          totalViews,
        }));
      }

      if (resourcesData.success) {
        setRecentResources(resourcesData.data.slice(0, 5));
        setStats((prev) => ({
          ...prev,
          totalResources: resourcesData.total || 0,
        }));
      }

      if (applicationsData.success) {
        setRecentApplications(applicationsData.data.slice(0, 5));

        const applications = applicationsData.data;
        const pending = applications.filter(
          (app: any) => app.status === "pending",
        ).length;
        const accepted = applications.filter(
          (app: any) => app.status === "accepted",
        ).length;
        const rejected = applications.filter(
          (app: any) => app.status === "rejected",
        ).length;

        setStats((prev) => ({
          ...prev,
          totalApplications: applications.length,
          pendingApplications: pending,
          acceptedApplications: accepted,
          rejectedApplications: rejected,
        }));
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Network: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      Fiber: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "5G": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Certifications: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      General: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return colors[category] || colors.General;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
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
    switch (fileType) {
      case "pdf":
        return "📄";
      case "document":
        return "📝";
      case "spreadsheet":
        return "📊";
      case "image":
        return "🖼️";
      default:
        return "📎";
    }
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {currentUser?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-400">
              Here's what's happening with your TelecomNet activity
            </p>
          </div>
          <Activity className="h-12 w-12 text-cyan-500 opacity-50" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Applications Stats */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">
                Job Applications
              </CardTitle>
              <Briefcase className="h-5 w-5 text-cyan-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">
                {stats.totalApplications}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-yellow-400">
                  <HourglassIcon className="h-3 w-3" />
                  {stats.pendingApplications} Pending
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  {stats.acceptedApplications}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Posts */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">
                Community Posts
              </CardTitle>
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">
                {stats.totalPosts}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-red-400">
                  <Heart className="h-3 w-3" />
                  {stats.totalLikes}
                </div>
                <div className="flex items-center gap-1 text-blue-400">
                  <MessageSquare className="h-3 w-3" />
                  {stats.totalComments}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">
                Resources
              </CardTitle>
              <BookOpen className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">
                {stats.totalResources}
              </div>
              <p className="text-xs text-slate-400">
                Available learning materials
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Engagement */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Views
              </CardTitle>
              <Eye className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">
                {stats.totalViews}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <TrendingUp className="h-3 w-3" />
                Community engagement
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
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
              <Link href="/professional/applications">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
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
                        {app.job.location}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        Applied{" "}
                        {formatDistanceToNow(new Date(app.appliedAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <Badge className={getStatusColor(app.status)}>
                      <span className="mr-1">{getStatusIcon(app.status)}</span>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
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
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
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
              recentPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-white flex-1 line-clamp-2">
                      {post.title}
                    </h3>
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
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
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
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
                Latest learning materials and documents
              </CardDescription>
            </div>
            <Link href="/professional-dashboard/resources">
              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700"
              >
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
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
                          {formatDistanceToNow(new Date(resource.createdAt), {
                            addSuffix: true,
                          })}
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

      {/* Quick Actions */}
      {/* <Card className="bg-linear-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-slate-400">
            Get started with common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/professional-dashboard/jobs">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </Link>
            <Link href="/professional-dashboard/posts">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                View Posts
              </Button>
            </Link>
            <Link href="/professional-dashboard/resources">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <BookOpen className="h-4 w-4 mr-2" />
                View Resources
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default ProfessionalDashboard;
