"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Building2,
  Clock,
  ExternalLink,
  Loader2,
  Briefcase,
  Globe,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import JobApplicationModal from "./Jobapplicationmodal";

interface ExternalJob {
  id: string;
  title: string;
  company: {
    name: string;
    image?: string;
    addresses?: string[];
  };
  location: {
    location: string;
    country: string;
    countryCode: string;
  };
  description: string;
  applyUrl: string;
  datePublishedTimestamp?: number;
  dateOnIndeedTimestamp?: number;
}

interface ExternalJobsListProps {
  searchQuery: string;
  locationFilter: string;
}

const ExternalJobsList = ({
  searchQuery,
  locationFilter,
}: ExternalJobsListProps) => {
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchExternalJobs();
  }, [searchQuery, locationFilter]);

  const fetchExternalJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery || "Telecommunications",
        location: locationFilter || "United States",
        countryCode: "us",
      });

      const response = await fetch(
        `http://localhost:5000/api/jobs/external/preview?${params.toString()}`,
      );
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
      } else {
        toast.error(data.message || "Failed to fetch external jobs");
      }
    } catch (error) {
      console.error("Fetch external jobs error:", error);
      toast.error("Error loading external jobs");
    } finally {
      setLoading(false);
    }
  };

  // const handleApplyClick = (job: ExternalJob) => {
  //   // Transform external job to internal format for modal
  //   const transformedJob = {
  //     _id: job.id,
  //     title: job.title,
  //     company: job.company.name,
  //     description: job.description,
  //     location: job.location.location,
  //     requiredSkills: [],
  //     imageUrl: job.company.image || null,
  //     jobType: "other",
  //     salary: null,
  //     source: "rapidapi",
  //     applicationCount: 0,
  //     createdAt: job.datePublishedTimestamp
  //       ? new Date(job.datePublishedTimestamp).toISOString()
  //       : new Date().toISOString(),
  //     acceptsApplications: true,
  //     applyUrl: job.applyUrl,
  //     postedBy: {
  //       name: job.company.name,
  //       email: "",
  //       profileImage: job.company.image || null,
  //     },
  //   };

  //   setSelectedJob(transformedJob);
  //   setIsModalOpen(true);
  // };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Recently posted";

    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
          <p className="text-slate-400 text-lg">
            Loading external opportunities...
          </p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700 p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-slate-800">
            <Globe className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            No External Jobs Found
          </h3>
          <p className="text-slate-400 max-w-md">
            We couldn't find any external jobs matching your criteria. Try
            adjusting your search terms or check back later.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Info Banner */}
      <Card className="bg-linear-to-r from-blue-900/20 to-cyan-900/20 border-blue-700/50 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Globe className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              External Job Listings
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              These positions are sourced from external job boards. You can save
              them to your applications or apply directly on the company's
              website.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Card
            key={job.id}
            className="bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {/* External Badge */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                >
                  <Globe className="mr-1 h-3 w-3" />
                  External
                </Badge>
                {job.company.image && (
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-slate-800">
                    <img
                      src={job.company.image}
                      alt={job.company.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Header */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {job.title}
                </h3>

                <div className="flex items-center gap-2 text-slate-400">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {job.company.name}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 line-clamp-4">
                {truncateDescription(job.description, 180)}
              </p>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm">{job.location.location}</span>
                </div>

                {job.location.country && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">{job.location.country}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span className="text-sm">
                    {formatDate(job.datePublishedTimestamp)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-2">
                {/* <Button
                  onClick={() => handleApplyClick(job)}
                  variant="outline"
                  className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-cyan-500 transition-all duration-200"
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Save & Apply
                </Button> */}
                <Button
                  onClick={() => window.open(job.applyUrl, "_blank")}
                  className="bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200"
                >
                  Apply Direct
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedJob(null);
          }}
          onSuccess={() => {
            toast.success("Application saved successfully!");
          }}
        />
      )}
    </>
  );
};

export default ExternalJobsList;
