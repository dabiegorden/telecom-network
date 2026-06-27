"use client";

import { safeFormatDate } from "@/lib/utils";

import { useEffect, useState, useCallback } from "react";
import { jobsApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Pencil,
  Trash2,
  Loader2,
  Briefcase,
  Plus,
  X,
  ImageIcon,
  Eye,
  RefreshCw,
  ExternalLink,
  Users,
  Globe,
  Building2,
  ChevronRight,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  requiredSkills?: string[];
  imageUrl?: string | null;
  imagePublicId?: string | null;
  applyUrl?: string | null;
  salary?: string | null;
  jobType?: string;
  source?: "internal" | "rapidapi";
  acceptsApplications?: boolean;
  applicationCount?: number;
  postedBy?: { name: string; email: string };
  createdAt: string;
}

interface Application {
  _id: string;
  applicant: { name: string; email: string; profileImage?: string };
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired";
  coverLetter?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  createdAt: string;
}

const emptyForm = {
  title: "",
  company: "",
  description: "",
  location: "",
  requiredSkills: "",
  salary: "",
  applyUrl: "",
  jobType: "other",
  acceptsApplications: true,
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  reviewing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  shortlisted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  hired: "bg-green-500/20 text-green-400 border-green-500/30",
};

// ─── API helpers (add these to your lib/api.ts if not there) ─────────────────
// jobsApi.syncExternalJobs(params) → POST /api/jobs/sync-external
// jobsApi.getJobApplications(id)   → GET /api/jobs/:id/applications
// jobsApi.updateApplicationStatus(id, status, notes) → PATCH /api/applications/:id/status

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [applicationsDialogOpen, setApplicationsDialogOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync params
  const [syncQuery, setSyncQuery] = useState("Telecommunications");
  const [syncLocation, setSyncLocation] = useState("United States");
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getAllJobs();
      if (response.success) setJobs(response.data);
      else toast.error(response.message || "Failed to fetch jobs");
    } catch {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useCallback(() => {
    if (activeTab === "internal")
      return jobs.filter((j) => j.source !== "rapidapi");
    if (activeTab === "external")
      return jobs.filter((j) => j.source === "rapidapi");
    return jobs;
  }, [jobs, activeTab]);

  // ─── Image helpers ─────────────────────────────────────────────────────────

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("company", formData.company);
    fd.append("description", formData.description);
    fd.append("location", formData.location);
    fd.append("requiredSkills", formData.requiredSkills);
    fd.append("salary", formData.salary);
    fd.append("applyUrl", formData.applyUrl);
    fd.append("jobType", formData.jobType);
    fd.append("acceptsApplications", String(formData.acceptsApplications));
    if (selectedImage) fd.append("image", selectedImage);
    return fd;
  };

  // ─── CRUD handlers ─────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (
      !formData.title ||
      !formData.company ||
      !formData.description ||
      !formData.location
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setSubmitting(true);
      const response = await jobsApi.createJob(buildFormData());
      if (response.success) {
        toast.success("Job created successfully");
        setCreateDialogOpen(false);
        setFormData(emptyForm);
        clearImage();
        fetchJobs();
      } else toast.error(response.message || "Failed to create job");
    } catch {
      toast.error("Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      requiredSkills: job.requiredSkills?.join(", ") || "",
      salary: job.salary || "",
      applyUrl: job.applyUrl || "",
      jobType: job.jobType || "other",
      acceptsApplications: job.acceptsApplications ?? true,
    });
    setImagePreview(job.imageUrl || null);
    setSelectedImage(null);
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedJob) return;
    try {
      setSubmitting(true);
      const response = await jobsApi.updateJob(
        selectedJob._id,
        buildFormData(),
      );
      if (response.success) {
        toast.success("Job updated successfully");
        setEditDialogOpen(false);
        clearImage();
        fetchJobs();
      } else toast.error(response.message || "Failed to update job");
    } catch {
      toast.error("Failed to update job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    try {
      setSubmitting(true);
      const response = await jobsApi.deleteJob(selectedJob._id);
      if (response.success) {
        toast.success("Job deleted successfully");
        setDeleteDialogOpen(false);
        fetchJobs();
      } else toast.error(response.message || "Failed to delete job");
    } catch {
      toast.error("Failed to delete job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewApplications = async (job: Job) => {
    setSelectedJob(job);
    setApplicationsDialogOpen(true);
    setLoadingApplications(true);
    try {
      // Call GET /api/jobs/:id/applications
      const res = await fetch(`/api/jobs/${job._id}/applications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) setApplications(data.data || []);
      else toast.error(data.message || "Failed to load applications");
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Status updated");
        setApplications((prev) =>
          prev.map((a) =>
            a._id === appId ? { ...a, status: data.data.status } : a,
          ),
        );
      } else toast.error(data.message);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch(
        `/api/jobs/sync-external?query=${encodeURIComponent(syncQuery)}&location=${encodeURIComponent(syncLocation)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.message}`);
        setSyncDialogOpen(false);
        fetchJobs();
      } else toast.error(data.message || "Sync failed");
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  // ─── Shared form JSX ───────────────────────────────────────────────────────

  const renderFormFields = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {/* Image */}
      <div className="space-y-2">
        <Label className="text-slate-300">
          Job Image <span className="text-slate-500 text-xs">(optional)</span>
        </Label>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="bg-slate-800 border-slate-700 text-white file:bg-slate-700 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded cursor-pointer"
            />
            {(selectedImage || imagePreview) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearImage}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {imagePreview ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-700">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-24 rounded-lg border border-dashed border-slate-700 bg-slate-800/50">
              <div className="flex flex-col items-center gap-1 text-slate-500">
                <ImageIcon className="h-6 w-6" />
                <span className="text-xs">No image selected</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">
            Job Title <span className="text-red-400">*</span>
          </Label>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Senior Network Engineer"
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">
            Company <span className="text-red-400">*</span>
          </Label>
          <Input
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            placeholder="MTN Ghana"
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">
          Description <span className="text-red-400">*</span>
        </Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Detailed job description..."
          className="bg-slate-800 border-slate-700 text-white min-h-28"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">
            Location <span className="text-red-400">*</span>
          </Label>
          <Input
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="Accra, Ghana"
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Job Type</Label>
          <select
            value={formData.jobType}
            onChange={(e) =>
              setFormData({ ...formData, jobType: e.target.value })
            }
            className="w-full h-10 rounded-md bg-slate-800 border border-slate-700 text-white px-3 text-sm"
          >
            {[
              "full-time",
              "part-time",
              "contract",
              "internship",
              "remote",
              "other",
            ].map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">
            Salary <span className="text-slate-500 text-xs">(optional)</span>
          </Label>
          <Input
            value={formData.salary}
            onChange={(e) =>
              setFormData({ ...formData, salary: e.target.value })
            }
            placeholder="$80k–$120k / year"
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">
            External Apply URL{" "}
            <span className="text-slate-500 text-xs">(optional)</span>
          </Label>
          <Input
            value={formData.applyUrl}
            onChange={(e) =>
              setFormData({ ...formData, applyUrl: e.target.value })
            }
            placeholder="https://..."
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">
          Required Skills{" "}
          <span className="text-slate-500 text-xs">(comma separated)</span>
        </Label>
        <Input
          value={formData.requiredSkills}
          onChange={(e) =>
            setFormData({ ...formData, requiredSkills: e.target.value })
          }
          placeholder="5G, Network Design, RF Engineering"
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
        <input
          type="checkbox"
          id="acceptsApplications"
          checked={formData.acceptsApplications}
          onChange={(e) =>
            setFormData({ ...formData, acceptsApplications: e.target.checked })
          }
          className="w-4 h-4 accent-cyan-500"
        />
        <Label
          htmlFor="acceptsApplications"
          className="text-slate-300 cursor-pointer"
        >
          Accept in-app applications for this job
        </Label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const displayedJobs = filteredJobs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-linear-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
            <Briefcase className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Job Posts</h1>
            <p className="text-slate-400">
              Manage all job postings & applications
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setSyncDialogOpen(true)}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2"
          >
            <Globe className="h-4 w-4" />
            Sync External
          </Button>
          <Button
            onClick={() => {
              setFormData(emptyForm);
              clearImage();
              setCreateDialogOpen(true);
            }}
            className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Jobs", value: jobs.length, color: "text-white" },
          {
            label: "Internal",
            value: jobs.filter((j) => j.source !== "rapidapi").length,
            color: "text-orange-400",
          },
          {
            label: "External (API)",
            value: jobs.filter((j) => j.source === "rapidapi").length,
            color: "text-cyan-400",
          },
        ].map((stat) => (
          <Card key={stat.label} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table with tabs */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Jobs List</CardTitle>
              <CardDescription className="text-slate-400">
                Showing {displayedJobs.length} of {jobs.length} jobs
              </CardDescription>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-slate-700"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="internal"
                className="data-[state=active]:bg-slate-700"
              >
                <Building2 className="h-3 w-3 mr-1" /> Internal
              </TabsTrigger>
              <TabsTrigger
                value="external"
                className="data-[state=active]:bg-slate-700"
              >
                <Globe className="h-3 w-3 mr-1" /> External
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300 font-semibold">
                    Image
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Job Title
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Company
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Location
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Type
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Source
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Skills
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Applications
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold">
                    Posted
                  </TableHead>
                  <TableHead className="text-slate-300 font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedJobs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center text-slate-500 py-12"
                    >
                      No job postings yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedJobs.map((job) => (
                    <TableRow
                      key={job._id}
                      className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <TableCell>
                        {job.imageUrl ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
                            <Image
                              src={job.imageUrl}
                              alt={job.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-slate-600" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-white max-w-45 truncate">
                        {job.title}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {job.company}
                      </TableCell>
                      <TableCell className="text-slate-300 max-w-30 truncate">
                        {job.location}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-slate-700 text-slate-300 text-xs capitalize">
                          {job.jobType || "other"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.source === "rapidapi" ? (
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                            <Globe className="h-3 w-3 mr-1" /> API
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                            <Building2 className="h-3 w-3 mr-1" /> Internal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {job.requiredSkills?.slice(0, 2).map((skill, idx) => (
                            <Badge
                              key={idx}
                              className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {(job.requiredSkills?.length ?? 0) > 2 && (
                            <Badge className="bg-slate-700 text-slate-300 text-xs">
                              +{job.requiredSkills!.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleViewApplications(job)}
                          className="flex items-center gap-1 text-sm text-slate-300 hover:text-cyan-400 transition-colors"
                        >
                          <Users className="h-4 w-4" />
                          <span>{job.applicationCount ?? 0}</span>
                        </button>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {safeFormatDate(job.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedJob(job);
                              setViewDialogOpen(true);
                            }}
                            className="text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Edit (only internal) */}
                          {job.source !== "rapidapi" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(job)}
                              className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {/* External link */}
                          {job.applyUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            >
                              <a
                                href={job.applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedJob(job);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── View Job Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-orange-400" />
              Job Details
            </DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-5">
              {selectedJob.imageUrl && (
                <div className="relative w-full h-52 rounded-xl overflow-hidden border border-slate-700">
                  <Image
                    src={selectedJob.imageUrl}
                    alt={selectedJob.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedJob.title}
                  </h2>
                  <p className="text-slate-400 text-lg">
                    {selectedJob.company}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end shrink-0">
                  {selectedJob.source === "rapidapi" ? (
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      <Globe className="h-3 w-3 mr-1" /> External
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      Internal
                    </Badge>
                  )}
                  <Badge className="bg-slate-700 text-slate-300 capitalize">
                    {selectedJob.jobType}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span>{selectedJob.location}</span>
                </div>
                {selectedJob.salary && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span>{selectedJob.salary}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span>{selectedJob.applicationCount ?? 0} applications</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>
                    {safeFormatDate(selectedJob.createdAt)}
                  </span>
                </div>
              </div>

              {selectedJob.requiredSkills &&
                selectedJob.requiredSkills.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-sm font-medium mb-2">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requiredSkills.map((s, i) => (
                        <Badge
                          key={i}
                          className="bg-orange-500/20 text-orange-400 border-orange-500/30"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">
                  Description
                </p>
                <div className="bg-slate-800/50 rounded-lg p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-line border border-slate-700">
                  {selectedJob.description}
                </div>
              </div>

              {selectedJob.postedBy && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <span>Posted by:</span>
                  <span className="text-slate-300">
                    {selectedJob.postedBy.name} ({selectedJob.postedBy.email})
                  </span>
                </div>
              )}

              {selectedJob.applyUrl && (
                <a
                  href={selectedJob.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  View original listing
                </a>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleViewApplications(selectedJob);
                  }}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2"
                >
                  <Users className="h-4 w-4" /> View Applications
                </Button>
                {selectedJob.source !== "rapidapi" && (
                  <Button
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleEdit(selectedJob);
                    }}
                    className="bg-linear-to-r from-cyan-500 to-blue-500 text-white gap-2"
                  >
                    <Pencil className="h-4 w-4" /> Edit Job
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Applications Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={applicationsDialogOpen}
        onOpenChange={setApplicationsDialogOpen}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Applications — {selectedJob?.title}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedJob?.company} · {applications.length} applicant
              {applications.length !== 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>
          {loadingApplications ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No applications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center">
                        {app.applicant.profileImage ? (
                          <Image
                            src={app.applicant.profileImage}
                            alt={app.applicant.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-slate-300 font-bold text-sm">
                            {app.applicant.name?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {app.applicant.name}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {app.applicant.email}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Applied {safeFormatDate(app.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        className={
                          statusColors[app.status] ||
                          "bg-slate-700 text-slate-300"
                        }
                      >
                        {app.status}
                      </Badge>
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleUpdateStatus(app._id, e.target.value)
                        }
                        className="h-8 text-xs rounded bg-slate-700 border-slate-600 text-white px-2"
                      >
                        {[
                          "pending",
                          "reviewing",
                          "shortlisted",
                          "rejected",
                          "hired",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {app.coverLetter && (
                    <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                      <p className="text-slate-400 text-xs font-medium mb-1">
                        Cover Letter
                      </p>
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      {app.resumeFileName || "View Resume"}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Sync External Jobs Dialog ───────────────────────────────────────── */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              Sync External Jobs
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Fetch jobs from Indeed via RapidAPI and save them to your
              database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Search Query</Label>
              <Input
                value={syncQuery}
                onChange={(e) => setSyncQuery(e.target.value)}
                placeholder="e.g. Telecommunications, 5G, Network"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Location</Label>
              <Input
                value={syncLocation}
                onChange={(e) => setSyncLocation(e.target.value)}
                placeholder="e.g. United States, Accra, London"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 text-sm">
              ⚠️ Synced jobs will appear in the external tab and on user
              dashboards. Duplicate jobs are automatically skipped.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSyncDialogOpen(false)}
              disabled={syncing}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSync}
              disabled={syncing}
              className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Create New Job
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new job posting
            </DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={submitting}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Job</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update job information
            </DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={submitting}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={submitting}
              className="bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500">
              Delete Job
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete{" "}
              <strong className="text-white">{selectedJob?.title}</strong>? This
              will also remove all {selectedJob?.applicationCount ?? 0}{" "}
              application(s). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={submitting}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
