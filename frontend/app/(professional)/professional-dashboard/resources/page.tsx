"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderOpen,
  Search,
  Filter,
  Loader2,
  Download,
  FileText,
  Image as ImageIcon,
  File,
  FileSpreadsheet,
  Eye,
  Calendar,
  User,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface Resource {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: "image" | "pdf" | "document" | "spreadsheet" | "other";
  mimeType: string;
  fileSize: number;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
    profileImage: string | null;
    specialization?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

const ProfessionalResourcesPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  useEffect(() => {
    fetchResources();
  }, [page, searchQuery, fileTypeFilter]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (fileTypeFilter && fileTypeFilter !== "all")
        params.append("fileType", fileTypeFilter);

      const response = await fetch(`${API}/resources?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResources(data.data);
        setTotalPages(data.pages);
      } else {
        toast.error(data.message || "Failed to fetch resources");
      }
    } catch (error) {
      console.error("Fetch resources error:", error);
      toast.error("Error loading resources");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      window.open(resource.fileUrl, "_blank");
      toast.success("Download started");
    } catch (error) {
      toast.error("Error downloading file");
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="h-6 w-6" />;
      case "pdf":
        return <FileText className="h-6 w-6" />;
      case "document":
        return <File className="h-6 w-6" />;
      case "spreadsheet":
        return <FileSpreadsheet className="h-6 w-6" />;
      default:
        return <File className="h-6 w-6" />;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case "image":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "pdf":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "document":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "spreadsheet":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePreview = (resource: Resource) => {
    if (
      resource.fileType === "image" ||
      resource.fileType === "pdf" ||
      resource.mimeType.startsWith("image/")
    ) {
      setPreviewResource(resource);
    } else {
      handleDownload(resource);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
          <p className="text-slate-400 text-lg">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                  <FolderOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Resource Library
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Access educational materials and documentation
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {resources.length}
                </p>
                <p className="text-xs text-slate-400">Resources</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search resources by title or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 h-11"
              />
            </div>

            <Select
              value={fileTypeFilter}
              onValueChange={(value) => {
                setFileTypeFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500 focus:ring-cyan-500/20 h-11">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="pdf">PDFs</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || fileTypeFilter !== "all") && (
            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setFileTypeFilter("all");
                  setPage(1);
                }}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-700 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-slate-800">
              <FolderOpen className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              No Resources Found
            </h3>
            <p className="text-slate-400 max-w-md">
              We couldn't find any resources matching your criteria. Try
              adjusting your filters or check back later.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Card
                key={resource._id}
                className="bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10 overflow-hidden"
              >
                {/* Preview/Thumbnail */}
                <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                  {resource.fileType === "image" ? (
                    <Image
                      src={resource.fileUrl}
                      alt={resource.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-slate-800 to-slate-900">
                      <div
                        className={`p-6 rounded-2xl ${getFileTypeColor(resource.fileType)} bg-opacity-20`}
                      >
                        {getFileIcon(resource.fileType)}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

                  {/* File Type Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="outline"
                      className={getFileTypeColor(resource.fileType)}
                    >
                      {resource.fileType}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {resource.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {resource.description}
                  </p>

                  {/* Meta Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <User className="h-3 w-3 text-cyan-400" />
                      <span>{resource.uploadedBy.name}</span>
                      {resource.uploadedBy.specialization && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-400">
                            {resource.uploadedBy.specialization}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-orange-400" />
                        <span>{formatDate(resource.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-3 w-3 text-blue-400" />
                        <span>{formatFileSize(resource.fileSize)}</span>
                      </div>
                    </div>

                    {/* File Name */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/30 rounded-lg p-2">
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate">{resource.fileName}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handlePreview(resource)}
                      variant="outline"
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-cyan-500 transition-all duration-200"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {resource.fileType === "image" ||
                      resource.fileType === "pdf"
                        ? "Preview"
                        : "View"}
                    </Button>
                    <Button
                      onClick={() => handleDownload(resource)}
                      className="bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      onClick={() => setPage(pageNum)}
                      className={
                        pageNum === page
                          ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white"
                          : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-cyan-500"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
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

      {/* Preview Modal */}
      {previewResource && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewResource(null)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {previewResource.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {previewResource.fileName}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setPreviewResource(null)}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Close
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
              {previewResource.fileType === "image" ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={previewResource.fileUrl}
                    alt={previewResource.title}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              ) : previewResource.fileType === "pdf" ? (
                <iframe
                  src={previewResource.fileUrl}
                  className="w-full h-[70vh] rounded-lg"
                  title={previewResource.title}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">Preview not available</p>
                  <Button
                    onClick={() => handleDownload(previewResource)}
                    className="mt-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalResourcesPage;
