"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  ExternalLink,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import JobApplicationModal from "./Jobapplicationmodal";

interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  requiredSkills: string[];
  imageUrl: string | null;
  jobType: string;
  salary: string | null;
  source: string;
  applicationCount: number;
  createdAt: string;
  acceptsApplications: boolean;
  applyUrl: string | null;
  postedBy: {
    name: string;
    email: string;
    profileImage: string | null;
  };
}

interface InternalJobsListProps {
  searchQuery: string;
  locationFilter: string;
  jobTypeFilter: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

const InternalJobsList = ({
  searchQuery,
  locationFilter,
  jobTypeFilter,
}: InternalJobsListProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchJobs();

    // Listen for refresh event
    const handleRefresh = () => fetchJobs();
    window.addEventListener("refreshJobs", handleRefresh);
    return () => window.removeEventListener("refreshJobs", handleRefresh);
  }, [page, searchQuery, locationFilter, jobTypeFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        source: "internal",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (locationFilter) params.append("location", locationFilter);
      if (jobTypeFilter && jobTypeFilter !== "all")
        params.append("jobType", jobTypeFilter);

      const response = await fetch(`${API}/jobs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
        setTotalPages(data.pages);
      } else {
        toast.error(data.message || "Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Fetch jobs error:", error);
      toast.error("Error loading jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job: Job) => {
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank");
    } else {
      setSelectedJob(job);
      setIsModalOpen(true);
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "full-time":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "part-time":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "contract":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "internship":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "remote":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
          <p className="text-slate-400 text-lg">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700 p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-slate-800">
            <Briefcase className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">No Jobs Found</h3>
          <p className="text-slate-400 max-w-md">
            We couldn't find any jobs matching your criteria. Try adjusting your
            filters or check back later.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Card
            key={job._id}
            className="bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10 overflow-hidden"
          >
            {/* Job Image */}
            {job.imageUrl && (
              <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                <Image
                  src={job.imageUrl}
                  alt={job.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
              </div>
            )}

            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {job.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`${getJobTypeColor(job.jobType)} shrink-0`}
                  >
                    {job.jobType}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">{job.company}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 line-clamp-3">
                {job.description}
              </p>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm">{job.location}</span>
                </div>

                {job.salary && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-sm">{job.salary}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span className="text-sm">{formatDate(job.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">
                    {job.applicationCount} applicant
                    {job.applicationCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Skills */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.slice(0, 3).map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-slate-800/50 text-slate-300 border-slate-700 text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {job.requiredSkills.length > 3 && (
                    <Badge
                      variant="outline"
                      className="bg-slate-800/50 text-slate-300 border-slate-700 text-xs"
                    >
                      +{job.requiredSkills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Apply Button */}
              <Button
                onClick={() => handleApplyClick(job)}
                disabled={!job.acceptsApplications}
                className="w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 group-hover:shadow-cyan-500/40"
              >
                {job.applyUrl ? (
                  <>
                    Apply Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </>
                ) : job.acceptsApplications ? (
                  <>
                    Apply Now
                    <TrendingUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Applications Closed"
                )}
              </Button>
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
            ))}
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

      {/* Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedJob(null);
          }}
          onSuccess={fetchJobs}
        />
      )}
    </>
  );
};

export default InternalJobsList;
