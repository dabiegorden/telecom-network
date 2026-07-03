"use client";

import { safeFormatDate, downloadFile } from "@/lib/utils";

import { useEffect, useState, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {
  Pencil,
  Trash2,
  Loader2,
  Plus,
  X,
  Eye,
  Download,
  BookOpen,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  ExternalLink,
  Upload,
  Search,
  Calendar,
  User,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FileCategory =
  | "all"
  | "image"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "other";

interface Resource {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  filePublicId?: string | null;
  fileName?: string | null;
  fileType?: FileCategory;
  mimeType?: string | null;
  fileSize?: number | null;
  uploadedBy?: { name: string; email: string; profileImage?: string };
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FILE_ICON: Record<string, React.ReactNode> = {
  image: <FileImage className="h-5 w-5 text-pink-400" />,
  pdf: <FileText className="h-5 w-5 text-red-400" />,
  document: <FileText className="h-5 w-5 text-blue-400" />,
  spreadsheet: <FileSpreadsheet className="h-5 w-5 text-green-400" />,
  other: <File className="h-5 w-5 text-slate-400" />,
};

const FILE_BADGE: Record<string, string> = {
  image: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  pdf: "bg-red-500/20 text-red-400 border-red-500/30",
  document: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  spreadsheet: "bg-green-500/20 text-green-400 border-green-500/30",
  other: "bg-slate-700 text-slate-300 border-slate-600",
};

const ACCEPT_STRING =
  "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv";

const TABS: { value: FileCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "pdf", label: "PDFs" },
  { value: "document", label: "Docs" },
  { value: "spreadsheet", label: "Sheets" },
  { value: "other", label: "Other" },
];

const emptyForm = { title: "", description: "" };

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<FileCategory>("all");
  const [search, setSearch] = useState("");

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [selected, setSelected] = useState<Resource | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "100" });
      if (activeTab !== "all") params.append("fileType", activeTab);
      if (search) params.append("search", search);

      const res = await fetch(`${API}/resources?${params.toString()}`);
      const data = await res.json();

      if (data.success) setResources(data.data || []);
      else toast.error(data.message || "Failed to fetch resources");
    } catch {
      toast.error("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    const id = setTimeout(() => fetchResources(), 300);
    return () => clearTimeout(id);
  }, [fetchResources]);

  // ─── File helpers ───────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Title and description are required");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("file", selectedFile);

    try {
      setSubmitting(true);
      const res = await fetch(`${API}/resources`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Resource uploaded successfully");
        setCreateOpen(false);
        setFormData(emptyForm);
        clearFile();
        fetchResources();
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (resource: Resource) => {
    setSelected(resource);
    setFormData({ title: resource.title, description: resource.description });
    clearFile();
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    if (!formData.title || !formData.description) {
      toast.error("Title and description are required");
      return;
    }

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    if (selectedFile) fd.append("file", selectedFile);

    try {
      setSubmitting(true);
      const res = await fetch(`${API}/resources/${selected._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Resource updated");
        setEditOpen(false);
        clearFile();
        fetchResources();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API}/resources/${selected._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Resource deleted");
        setDeleteOpen(false);
        fetchResources();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Stats ──────────────────────────────────────────────────────────────────

  const stats = {
    total: resources.length,
    images: resources.filter((r) => r.fileType === "image").length,
    pdfs: resources.filter((r) => r.fileType === "pdf").length,
    docs: resources.filter((r) => r.fileType === "document").length,
    sheets: resources.filter((r) => r.fileType === "spreadsheet").length,
  };

  // ─── Shared form JSX ────────────────────────────────────────────────────────

  const renderForm = (isEdit = false) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {/* File upload zone */}
      <div className="space-y-2">
        <Label className="text-slate-300">
          {isEdit ? "Replace File" : "File"}{" "}
          {!isEdit && <span className="text-red-400">*</span>}
          {isEdit && (
            <span className="text-slate-500 text-xs ml-1">
              (leave blank to keep current)
            </span>
          )}
        </Label>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept={ACCEPT_STRING}
              onChange={handleFileChange}
              className="bg-slate-800 border-slate-700 text-white file:bg-slate-700 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded cursor-pointer"
            />
            {selectedFile && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Image preview or file info */}
          {selectedFile ? (
            filePreview ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-700">
                <Image
                  src={filePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                {
                  FILE_ICON[
                    selectedFile.type.startsWith("image/")
                      ? "image"
                      : selectedFile.type === "application/pdf"
                        ? "pdf"
                        : selectedFile.type.includes("sheet") ||
                            selectedFile.type === "text/csv"
                          ? "spreadsheet"
                          : selectedFile.type.includes("word")
                            ? "document"
                            : "other"
                  ]
                }
                <div>
                  <p className="text-white text-sm font-medium">
                    {selectedFile.name}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {formatBytes(selectedFile.size)}
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-24 rounded-lg border border-dashed border-slate-700 bg-slate-800/50 text-slate-500 gap-1">
              <Upload className="h-6 w-6" />
              <span className="text-xs">
                Images, PDF, Word, Excel, CSV — up to 20 MB
              </span>
            </div>
          )}
        </div>
      </div>

      {/* If editing, show current file info */}
      {isEdit && selected && !selectedFile && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
          {FILE_ICON[selected.fileType || "other"]}
          <div className="flex-1 min-w-0">
            <p className="text-slate-300 text-sm font-medium truncate">
              {selected.fileName || "Current file"}
            </p>
            <p className="text-slate-500 text-xs">
              {formatBytes(selected.fileSize)}
            </p>
          </div>
          <a
            href={selected.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-slate-300">
          Title <span className="text-red-400">*</span>
        </Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="5G Network Architecture Guide"
          className="bg-slate-800 border-slate-700 text-white"
        />
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
          placeholder="A comprehensive guide covering 5G architecture, deployment strategies..."
          className="bg-slate-800 border-slate-700 text-white min-h-24"
        />
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading && resources.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-linear-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
            <BookOpen className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Resources</h1>
            <p className="text-slate-400">Manage uploaded learning materials</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setFormData(emptyForm);
            clearFile();
            setCreateOpen(true);
          }}
          className="bg-linear-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Images", value: stats.images, color: "text-pink-400" },
          { label: "PDFs", value: stats.pdfs, color: "text-red-400" },
          { label: "Docs", value: stats.docs, color: "text-blue-400" },
          { label: "Sheets", value: stats.sheets, color: "text-green-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Table card ──────────────────────────────────────────────────────── */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">Resources Library</CardTitle>
              <CardDescription className="text-slate-400">
                {resources.length} item{resources.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="bg-slate-800 border-slate-700 text-white pl-9"
              />
            </div>
          </div>
          {/* Type filter tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as FileCategory)}
            className="mt-2"
          >
            <TabsList className="bg-slate-800 border-slate-700">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="data-[state=active]:bg-slate-700 text-slate-400 data-[state=active]:text-white"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
            </div>
          ) : (
            <div className="rounded-lg border border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300 font-semibold">
                      File
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold">
                      Title
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold">
                      Type
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold">
                      Size
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold">
                      Uploaded By
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold">
                      Date
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-slate-500 py-14"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <BookOpen className="h-10 w-10 opacity-30" />
                          <p>No resources found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    resources.map((resource) => (
                      <TableRow
                        key={resource._id}
                        className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                      >
                        {/* File thumbnail / icon */}
                        <TableCell>
                          {resource.fileType === "image" && resource.fileUrl ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                              <Image
                                src={resource.fileUrl}
                                alt={resource.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                              {FILE_ICON[resource.fileType || "other"]}
                            </div>
                          )}
                        </TableCell>

                        {/* Title + filename */}
                        <TableCell>
                          <p className="font-medium text-white">
                            {resource.title}
                          </p>
                          {resource.fileName && (
                            <p className="text-slate-500 text-xs truncate max-w-50">
                              {resource.fileName}
                            </p>
                          )}
                        </TableCell>

                        {/* Badge */}
                        <TableCell>
                          <Badge
                            className={FILE_BADGE[resource.fileType || "other"]}
                          >
                            {(resource.fileType || "other")
                              .charAt(0)
                              .toUpperCase() +
                              (resource.fileType || "other").slice(1)}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-slate-300 text-sm">
                          {formatBytes(resource.fileSize)}
                        </TableCell>

                        <TableCell className="text-slate-300">
                          {resource.uploadedBy?.name || "Unknown"}
                        </TableCell>

                        <TableCell className="text-slate-300">
                          {safeFormatDate(resource.createdAt)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelected(resource);
                                setViewOpen(true);
                              }}
                              className="text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadFile(resource.fileUrl, resource.fileName || resource.title)}
                              className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(resource)}
                              className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelected(resource);
                                setDeleteOpen(true);
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
          )}
        </CardContent>
      </Card>

      {/* ── View Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-400" />
              Resource Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Image preview */}
              {selected.fileType === "image" && selected.fileUrl && (
                <div className="relative w-full h-52 rounded-xl overflow-hidden border border-slate-700">
                  <Image
                    src={selected.fileUrl}
                    alt={selected.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Non-image file info */}
              {selected.fileType !== "image" && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center">
                    {FILE_ICON[selected.fileType || "other"]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {selected.fileName || selected.title}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {formatBytes(selected.fileSize)}
                    </p>
                    <Badge
                      className={`mt-1 text-xs ${FILE_BADGE[selected.fileType || "other"]}`}
                    >
                      {selected.fileType?.toUpperCase() || "FILE"}
                    </Badge>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {selected.title}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {selected.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>{selected.uploadedBy?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>
                    {safeFormatDate(selected.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={() => downloadFile(selected.fileUrl, selected.fileName || selected.title)}
                  className="flex-1 bg-linear-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <a
                    href={selected.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Upload Resource
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Upload a file to the resources library
            </DialogDescription>
          </DialogHeader>
          {renderForm(false)}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={submitting}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="bg-linear-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Edit Resource
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Update title, description, or replace the file
            </DialogDescription>
          </DialogHeader>
          {renderForm(true)}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
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
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500">
              Delete Resource
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete{" "}
              <strong className="text-white">{selected?.title}</strong>? The
              file will be permanently removed from Cloudinary. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
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
              Delete Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
