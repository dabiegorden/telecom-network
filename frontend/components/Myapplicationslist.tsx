"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Building2,
  Clock,
  Loader2,
  Briefcase,
  ExternalLink,
  Trash2,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    imageUrl: string | null;
    applyUrl: string | null;
    source: string;
    jobType: string;
    salary: string | null;
  };
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired";
  coverLetter: string;
  resumeUrl: string | null;
  resumeFileName: string | null;
  createdAt: string;
  updatedAt: string;
}

const MyApplicationsList = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view applications");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(
        `http://localhost:5000/api/applications/my/all?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setApplications(data.data);
        setTotalPages(data.pages);
      } else {
        toast.error(data.message || "Failed to fetch applications");
      }
    } catch (error) {
      console.error("Fetch applications error:", error);
      toast.error("Error loading applications");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/applications/${deleteId}/withdraw`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Application withdrawn successfully");
        fetchApplications();
      } else {
        toast.error(data.message || "Failed to withdraw application");
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      toast.error("Error withdrawing application");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "reviewing":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "shortlisted":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "hired":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "hired":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "reviewing":
        return <Eye className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
          <p className="text-slate-400 text-lg">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Filter Bar */}
      <Card className="bg-slate-900/50 border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-white font-semibold">Filter by Status:</h3>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-45 bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500 focus:ring-cyan-500/20">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-slate-400">
            Total Applications: {applications.length}
          </div>
        </div>
      </Card>

      {applications.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-700 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-slate-800">
              <Briefcase className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              No Applications Yet
            </h3>
            <p className="text-slate-400 max-w-md">
              You haven't applied to any jobs yet. Browse available positions
              and start applying!
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map((app) => (
              <Card
                key={app._id}
                className="bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Job Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-white hover:text-cyan-400 transition-colors">
                              {app.job.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={getStatusColor(app.status)}
                            >
                              {getStatusIcon(app.status)}
                              <span className="ml-1 capitalize">
                                {app.status}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-cyan-400" />
                              <span>{app.job.company}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-cyan-400" />
                              <span>{app.job.location}</span>
                            </div>
                            {app.job.salary && (
                              <div className="flex items-center gap-2">
                                <span className="text-green-400">
                                  {app.job.salary}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Source Badge */}
                        <Badge
                          variant="outline"
                          className={
                            app.job.source === "internal"
                              ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }
                        >
                          {app.job.source === "internal"
                            ? "Internal"
                            : "External"}
                        </Badge>
                      </div>

                      {/* Application Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Applied On</p>
                          <div className="flex items-center gap-2 text-white">
                            <Calendar className="h-4 w-4 text-cyan-400" />
                            <span className="font-medium">
                              {formatDate(app.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Last Updated</p>
                          <div className="flex items-center gap-2 text-white">
                            <Clock className="h-4 w-4 text-orange-400" />
                            <span className="font-medium">
                              {formatDate(app.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter Preview */}
                      {app.coverLetter && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-white">
                            Cover Letter:
                          </p>
                          <p className="text-sm text-slate-400 line-clamp-2">
                            {app.coverLetter}
                          </p>
                        </div>
                      )}

                      {/* Resume */}
                      {app.resumeUrl && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                          <FileText className="h-5 w-5 text-cyan-400" />
                          <span className="text-sm text-white flex-1">
                            {app.resumeFileName || "Resume"}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(app.resumeUrl!, "_blank")
                            }
                            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      {app.job.applyUrl && (
                        <Button
                          onClick={() =>
                            window.open(app.job.applyUrl!, "_blank")
                          }
                          variant="outline"
                          className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-cyan-500"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Job
                        </Button>
                      )}
                      <Button
                        onClick={() => setDeleteId(app._id)}
                        variant="outline"
                        className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-cyan-500"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      onClick={() => setPage(p)}
                      className={
                        p === page
                          ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white"
                          : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-cyan-500"
                      }
                    >
                      {p}
                    </Button>
                  ),
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-cyan-500"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to withdraw this application? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                "Withdraw"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyApplicationsList;
