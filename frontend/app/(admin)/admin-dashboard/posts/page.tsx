"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Loader2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Pin,
  PinOff,
  MessageSquare,
  Heart,
  X,
  Upload,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Download,
  ExternalLink,
  Send,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  BookOpen,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category =
  | "all"
  | "Network"
  | "Fiber"
  | "5G"
  | "Certifications"
  | "General";

interface Attachment {
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentMime?: string | null;
  attachmentSize?: number | null;
}

interface Post extends Attachment {
  _id: string;
  title: string;
  content: string;
  category: string;
  author?: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    specialization?: string;
  };
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Comment extends Attachment {
  _id: string;
  content: string;
  user: { _id: string; name: string; email: string; profileImage?: string };
  likeCount: number;
  replyCount: number;
  parentComment?: string | null;
  createdAt: string;
  replies?: Comment[];
  showReplies?: boolean;
  loadingReplies?: boolean;
}

const API = "http://localhost:5000/api";
const CATEGORIES: Category[] = [
  "all",
  "Network",
  "Fiber",
  "5G",
  "Certifications",
  "General",
];
const CAT_COLORS: Record<string, string> = {
  Network: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Fiber: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "5G": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Certifications: "bg-green-500/20 text-green-400 border-green-500/30",
  General: "bg-slate-600/50 text-slate-300 border-slate-600",
};

const ACCEPT =
  "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fmt = (bytes?: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
};

const FileIcon = ({
  type,
  size = 4,
}: {
  type?: string | null;
  size?: number;
}) => {
  const cls = `h-${size} w-${size}`;
  if (type === "image") return <FileImage className={`${cls} text-pink-400`} />;
  if (type === "pdf") return <FileText className={`${cls} text-red-400`} />;
  if (type === "document")
    return <FileText className={`${cls} text-blue-400`} />;
  if (type === "spreadsheet")
    return <FileSpreadsheet className={`${cls} text-green-400`} />;
  return <File className={`${cls} text-slate-400`} />;
};

const Avatar = ({
  src,
  name,
  size = 8,
}: {
  src?: string;
  name?: string;
  size?: number;
}) => (
  <div
    className={`relative w-${size} h-${size} rounded-full overflow-hidden bg-slate-700 flex items-center justify-center shrink-0`}
  >
    {src ? (
      <Image src={src} alt={name || ""} fill className="object-cover" />
    ) : (
      <span className="text-slate-300 font-bold text-sm">
        {name?.[0]?.toUpperCase() || "?"}
      </span>
    )}
  </div>
);

// ─── Attachment preview (inline in feed) ─────────────────────────────────────

const AttachmentPreview = ({ item }: { item: Attachment }) => {
  if (!item.attachmentUrl) return null;
  return (
    <div className="mt-3">
      {item.attachmentType === "image" ? (
        <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer">
          <div className="relative w-full max-w-md h-52 rounded-xl overflow-hidden border border-slate-700 hover:opacity-90 transition-opacity">
            <Image
              src={item.attachmentUrl}
              alt={item.attachmentName || "attachment"}
              fill
              className="object-cover"
            />
          </div>
        </a>
      ) : (
        <a
          href={item.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="inline-flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors max-w-xs"
        >
          <FileIcon type={item.attachmentType} size={5} />
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate max-w-40">
              {item.attachmentName || "attachment"}
            </p>
            {item.attachmentSize && (
              <p className="text-slate-400 text-xs">
                {fmt(item.attachmentSize)}
              </p>
            )}
          </div>
          <Download className="h-4 w-4 text-slate-400 shrink-0" />
        </a>
      )}
    </div>
  );
};

// ─── File picker used in create/edit forms ────────────────────────────────────

const FilePicker = ({
  file,
  preview,
  onChange,
  onClear,
  label = "Attachment",
  optional = true,
}: {
  file: File | null;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  label?: string;
  optional?: boolean;
}) => (
  <div className="space-y-2">
    <Label className="text-slate-300">
      {label}{" "}
      {optional ? (
        <span className="text-slate-500 text-xs">(optional)</span>
      ) : (
        <span className="text-red-400">*</span>
      )}
    </Label>
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept={ACCEPT}
        onChange={onChange}
        className="bg-slate-800 border-slate-700 text-white file:bg-slate-700 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded cursor-pointer"
      />
      {file && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
    {file ? (
      preview ? (
        <div className="relative w-full h-36 rounded-lg overflow-hidden border border-slate-700">
          <Image src={preview} alt="preview" fill className="object-cover" />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <FileIcon
            type={
              file.type.startsWith("image/")
                ? "image"
                : file.type === "application/pdf"
                  ? "pdf"
                  : file.type.includes("sheet") || file.type === "text/csv"
                    ? "spreadsheet"
                    : file.type.includes("word")
                      ? "document"
                      : "other"
            }
            size={5}
          />
          <div>
            <p className="text-white text-sm">{file.name}</p>
            <p className="text-slate-400 text-xs">{fmt(file.size)}</p>
          </div>
        </div>
      )
    ) : (
      <div className="flex flex-col items-center justify-center h-16 rounded-lg border border-dashed border-slate-700 bg-slate-800/40 text-slate-500 gap-1">
        <Upload className="h-4 w-4" />
        <span className="text-xs">
          Images, PDF, Word, Excel, CSV · max 20MB
        </span>
      </div>
    )}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  // Selected post for detail / edit / delete
  const [selected, setSelected] = useState<Post | null>(null);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  // Create / edit form
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "General",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeAttach, setRemoveAttach] = useState(false);

  // Thread view state
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [commentPreview, setCommentPreview] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [replyPreview, setReplyPreview] = useState<string | null>(null);
  const [sendingComment, setSendingComment] = useState(false);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Fetch ───────────────────────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "50", sort });
      if (activeTab !== "all") params.append("category", activeTab);
      if (search) params.append("search", search);

      const res = await fetch(`${API}/posts/admin/all?${params.toString()}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) setPosts(data.data);
      else toast.error(data.message || "Failed to load posts");
    } catch (e) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, sort]);

  useEffect(() => {
    const id = setTimeout(fetchPosts, 300);
    return () => clearTimeout(id);
  }, [fetchPosts]);

  const fetchComments = async (postId: string) => {
    setLoadingComments(true);
    try {
      const res = await fetch(`${API}/posts/${postId}/comments?limit=50`);
      const data = await res.json();
      if (data.success)
        setComments(
          data.data.map((c: Comment) => ({
            ...c,
            showReplies: false,
            replies: [],
          })),
        );
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  // ─── File helpers ────────────────────────────────────────────────────────────

  const onFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setF: typeof setFile,
    setP: typeof setPreview,
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setF(f);
    if (f.type.startsWith("image/")) {
      const r = new FileReader();
      r.onloadend = () => setP(r.result as string);
      r.readAsDataURL(f);
    } else setP(null);
  };

  const clearFile = (setF: typeof setFile, setP: typeof setPreview) => {
    setF(null);
    setP(null);
  };

  // ─── Post CRUD ───────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!form.title || !form.content || !form.category) {
      toast.error("Title, content and category are required");
      return;
    }
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("content", form.content);
    fd.append("category", form.category);
    if (file) fd.append("attachment", file);

    try {
      setSubmitting(true);
      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Post created");
        setCreateOpen(false);
        setForm({ title: "", content: "", category: "General" });
        clearFile(setFile, setPreview);
        fetchPosts();
      } else toast.error(data.message || "Failed to create post");
    } catch {
      toast.error("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (post: Post) => {
    setSelected(post);
    setForm({
      title: post.title,
      content: post.content,
      category: post.category,
    });
    clearFile(setFile, setPreview);
    setRemoveAttach(false);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("content", form.content);
    fd.append("category", form.category);
    if (removeAttach) fd.append("removeAttachment", "true");
    if (file) fd.append("attachment", file);

    try {
      setSubmitting(true);
      const res = await fetch(`${API}/posts/${selected._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Post updated");
        setEditOpen(false);
        clearFile(setFile, setPreview);
        fetchPosts();
        if (viewOpen && selected) {
          // refresh viewed post
          const r2 = await fetch(`${API}/posts/${selected._id}`);
          const d2 = await r2.json();
          if (d2.success) setSelected(d2.data);
        }
      } else toast.error(data.message || "Update failed");
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
      const res = await fetch(`${API}/posts/${selected._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Post deleted");
        setDeleteOpen(false);
        setViewOpen(false);
        fetchPosts();
      } else toast.error(data.message || "Delete failed");
    } catch {
      toast.error("Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePin = async (post: Post) => {
    try {
      const res = await fetch(`${API}/posts/${post._id}/pin`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchPosts();
      } else toast.error(data.message);
    } catch {
      toast.error("Failed to toggle pin");
    }
  };

  // ─── Comment / reply ─────────────────────────────────────────────────────────

  const submitComment = async (parentId?: string) => {
    if (!selected) return;
    const text = parentId ? replyText : commentText;
    const f = parentId ? replyFile : commentFile;

    if (!text.trim() && !f) {
      toast.error("Please write something or attach a file");
      return;
    }

    const fd = new FormData();
    fd.append("content", text);
    if (parentId) fd.append("parentComment", parentId);
    if (f) fd.append("attachment", f);

    try {
      setSendingComment(true);
      const res = await fetch(`${API}/posts/${selected._id}/comments`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        if (parentId) {
          // Add reply to the parent comment
          setComments((prev) =>
            prev.map((c) =>
              c._id === parentId
                ? {
                    ...c,
                    replyCount: c.replyCount + 1,
                    replies: [...(c.replies || []), data.data],
                    showReplies: true,
                  }
                : c,
            ),
          );
          setReplyText("");
          clearFile(setReplyFile, setReplyPreview);
          setReplyingTo(null);
        } else {
          setComments((prev) => [data.data, ...prev]);
          setCommentText("");
          clearFile(setCommentFile, setCommentPreview);
        }
        // Update post comment count in list
        setPosts((prev) =>
          prev.map((p) =>
            p._id === selected._id
              ? { ...p, commentCount: p.commentCount + 1 }
              : p,
          ),
        );
        setSelected((prev) =>
          prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev,
        );
      } else toast.error(data.message || "Failed to post comment");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSendingComment(false);
    }
  };

  const loadReplies = async (comment: Comment) => {
    if (!selected) return;
    if (comment.showReplies) {
      setComments((prev) =>
        prev.map((c) =>
          c._id === comment._id ? { ...c, showReplies: false } : c,
        ),
      );
      return;
    }
    setComments((prev) =>
      prev.map((c) =>
        c._id === comment._id ? { ...c, loadingReplies: true } : c,
      ),
    );
    try {
      const res = await fetch(
        `${API}/posts/${selected._id}/comments/${comment._id}/replies`,
      );
      const data = await res.json();
      setComments((prev) =>
        prev.map((c) =>
          c._id === comment._id
            ? {
                ...c,
                replies: data.data || [],
                showReplies: true,
                loadingReplies: false,
              }
            : c,
        ),
      );
    } catch {
      setComments((prev) =>
        prev.map((c) =>
          c._id === comment._id ? { ...c, loadingReplies: false } : c,
        ),
      );
    }
  };

  const handleDeleteComment = async (comment: Comment, parentId?: string) => {
    if (!selected) return;
    try {
      const res = await fetch(
        `${API}/posts/${selected._id}/comments/${comment._id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Comment deleted");
        if (parentId) {
          setComments((prev) =>
            prev.map((c) =>
              c._id === parentId
                ? {
                    ...c,
                    replyCount: Math.max(0, c.replyCount - 1),
                    replies: (c.replies || []).filter(
                      (r) => r._id !== comment._id,
                    ),
                  }
                : c,
            ),
          );
        } else {
          setComments((prev) => prev.filter((c) => c._id !== comment._id));
        }
        setPosts((prev) =>
          prev.map((p) =>
            p._id === selected._id
              ? { ...p, commentCount: Math.max(0, p.commentCount - 1) }
              : p,
          ),
        );
        setSelected((prev) =>
          prev
            ? { ...prev, commentCount: Math.max(0, prev.commentCount - 1) }
            : prev,
        );
      } else toast.error(data.message);
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  // ─── Stats ────────────────────────────────────────────────────────────────────

  const stats = {
    total: posts.length,
    pinned: posts.filter((p) => p.isPinned).length,
    totalLikes: posts.reduce((a, p) => a + p.likeCount, 0),
    totalComments: posts.reduce((a, p) => a + p.commentCount, 0),
  };

  // ─── Post card ────────────────────────────────────────────────────────────────

  const PostCard = ({ post }: { post: Post }) => (
    <div
      className={`bg-slate-900/60 border rounded-xl p-4 transition-all hover:bg-slate-900/80 ${
        post.isPinned ? "border-violet-500/50" : "border-slate-800"
      }`}
    >
      {post.isPinned && (
        <div className="flex items-center gap-1 text-violet-400 text-xs font-medium mb-2">
          <Pin className="h-3 w-3" /> Pinned
        </div>
      )}

      <div className="flex items-start gap-3">
        <Avatar
          src={post.author?.profileImage}
          name={post.author?.name}
          size={9}
        />

        <div className="flex-1 min-w-0">
          {/* Author + meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">
              {post.author?.name || "Unknown"}
            </span>
            {post.author?.specialization && (
              <span className="text-slate-500 text-xs">
                {post.author.specialization}
              </span>
            )}
            <span className="text-slate-500 text-xs">·</span>
            <span className="text-slate-500 text-xs">
              {timeAgo(post.createdAt)}
            </span>
            <Badge
              className={`text-xs ml-auto ${CAT_COLORS[post.category] || CAT_COLORS.General}`}
            >
              {post.category}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-white font-bold mt-1 leading-snug">
            {post.title}
          </h3>

          {/* Content preview */}
          <p className="text-slate-400 text-sm mt-1 line-clamp-3 leading-relaxed">
            {post.content}
          </p>

          {/* Attachment */}
          {post.attachmentUrl && post.attachmentType === "image" && (
            <div className="relative w-full max-w-xs h-36 rounded-lg overflow-hidden border border-slate-700 mt-3">
              <Image
                src={post.attachmentUrl}
                alt="attachment"
                fill
                className="object-cover"
              />
            </div>
          )}
          {post.attachmentUrl && post.attachmentType !== "image" && (
            <div className="inline-flex items-center gap-2 mt-3 p-2 rounded-lg bg-slate-800 border border-slate-700 text-sm">
              <FileIcon type={post.attachmentType} size={4} />
              <span className="text-slate-300 truncate max-w-35">
                {post.attachmentName}
              </span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-slate-500 text-xs">
              <Heart className="h-3.5 w-3.5" /> {post.likeCount}
            </span>
            <span className="flex items-center gap-1 text-slate-500 text-xs">
              <MessageSquare className="h-3.5 w-3.5" /> {post.commentCount}
            </span>
            <span className="flex items-center gap-1 text-slate-500 text-xs">
              <Eye className="h-3.5 w-3.5" /> {post.viewCount}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelected(post);
              setViewOpen(true);
              fetchComments(post._id);
            }}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePin(post)}
            className={`h-8 w-8 ${post.isPinned ? "text-violet-400 hover:text-violet-300 hover:bg-violet-500/10" : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"}`}
          >
            {post.isPinned ? (
              <PinOff className="h-3.5 w-3.5" />
            ) : (
              <Pin className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEdit(post)}
            className="h-8 w-8 text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelected(post);
              setDeleteOpen(true);
            }}
            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  // ─── Comment row ─────────────────────────────────────────────────────────────

  const CommentRow = ({
    comment,
    depth = 0,
  }: {
    comment: Comment;
    depth?: number;
  }) => (
    <div
      className={`${depth > 0 ? "ml-10 border-l-2 border-slate-800 pl-4" : ""}`}
    >
      <div className="flex items-start gap-2.5 group py-1">
        <Avatar
          src={comment.user?.profileImage}
          name={comment.user?.name}
          size={7}
        />
        <div className="flex-1 min-w-0">
          <div className="bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/50">
            <div className="flex items-center justify-between gap-2">
              <span className="text-white text-sm font-semibold">
                {comment.user?.name}
              </span>
              <span className="text-slate-500 text-xs">
                {timeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-0.5 leading-relaxed">
              {comment.content}
            </p>
            <AttachmentPreview item={comment} />
          </div>
          {/* Actions */}
          <div className="flex items-center gap-3 mt-1 px-1">
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <Heart className="h-3 w-3" /> {comment.likeCount}
            </span>
            {depth === 0 && (
              <button
                onClick={() =>
                  setReplyingTo(
                    replyingTo?._id === comment._id ? null : comment,
                  )
                }
                className="text-slate-500 hover:text-cyan-400 text-xs transition-colors"
              >
                Reply
              </button>
            )}
            {depth === 0 && comment.replyCount > 0 && (
              <button
                onClick={() => loadReplies(comment)}
                className="text-slate-500 hover:text-violet-400 text-xs flex items-center gap-1 transition-colors"
              >
                {comment.loadingReplies ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : comment.showReplies ? (
                  <>
                    <ChevronUp className="h-3 w-3" /> Hide {comment.replyCount}{" "}
                    {comment.replyCount === 1 ? "reply" : "replies"}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" /> {comment.replyCount}{" "}
                    {comment.replyCount === 1 ? "reply" : "replies"}
                  </>
                )}
              </button>
            )}
            <button
              onClick={() =>
                handleDeleteComment(comment, comment.parentComment || undefined)
              }
              className="text-slate-600 hover:text-red-400 text-xs ml-auto opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          {/* Inline reply box */}
          {depth === 0 && replyingTo?._id === comment._id && (
            <div className="mt-2 ml-2 space-y-2">
              <div className="flex items-start gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.user?.name}...`}
                  className="bg-slate-800 border-slate-700 text-white text-sm min-h-15 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                      submitComment(comment._id);
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-slate-400 hover:text-slate-300 transition-colors">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept={ACCEPT}
                    className="hidden"
                    onChange={(e) =>
                      onFileChange(e, setReplyFile, setReplyPreview)
                    }
                  />
                </label>
                {replyFile && (
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <FileIcon
                      type={
                        replyFile.type.startsWith("image/") ? "image" : "other"
                      }
                      size={3}
                    />
                    {replyFile.name}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-400"
                      onClick={() => clearFile(setReplyFile, setReplyPreview)}
                    />
                  </span>
                )}
                <Button
                  size="sm"
                  disabled={sendingComment}
                  onClick={() => submitComment(comment._id)}
                  className="ml-auto bg-violet-600 hover:bg-violet-700 text-white h-7 text-xs"
                >
                  {sendingComment ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3 mr-1" />
                  )}
                  Send
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingTo(null)}
                  className="text-slate-400 hover:text-slate-300 h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
              {replyPreview && (
                <div className="relative w-32 h-20 rounded overflow-hidden border border-slate-700">
                  <Image
                    src={replyPreview}
                    alt="preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {depth === 0 &&
        comment.showReplies &&
        (comment.replies || []).map((reply) => (
          <CommentRow
            key={reply._id}
            comment={{ ...reply, parentComment: comment._id }}
            depth={1}
          />
        ))}
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-linear-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30">
            <MessageSquare className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Community Posts</h1>
            <p className="text-slate-400">
              Manage the community discussion feed
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setForm({ title: "", content: "", category: "General" });
            clearFile(setFile, setPreview);
            setCreateOpen(true);
          }}
          className="bg-linear-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Total Posts",
            value: stats.total,
            icon: <BookOpen className="h-4 w-4" />,
            color: "text-white",
          },
          {
            label: "Pinned",
            value: stats.pinned,
            icon: <Pin className="h-4 w-4" />,
            color: "text-violet-400",
          },
          {
            label: "Total Likes",
            value: stats.totalLikes,
            icon: <Heart className="h-4 w-4" />,
            color: "text-pink-400",
          },
          {
            label: "Total Comments",
            value: stats.totalComments,
            icon: <MessageSquare className="h-4 w-4" />,
            color: "text-cyan-400",
          },
        ].map((s) => (
          <Card key={s.label} className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${s.color} opacity-60`}>{s.icon}</div>
              <div>
                <p className="text-slate-400 text-xs">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feed card */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-white">Posts Feed</CardTitle>
              <CardDescription className="text-slate-400">
                {posts.length} posts
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 rounded-md bg-slate-800 border border-slate-700 text-slate-300 px-3 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Popular</option>
              </select>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts..."
                  className="bg-slate-800 border-slate-700 text-white pl-9 w-52"
                />
              </div>
            </div>
          </div>
          {/* Category tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as Category)}
            className="mt-2"
          >
            <TabsList className="bg-slate-800 border-slate-700 flex-wrap h-auto gap-1">
              {CATEGORIES.map((c) => (
                <TabsTrigger
                  key={c}
                  value={c}
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 capitalize"
                >
                  {c}
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
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
              <MessageSquare className="h-10 w-10 opacity-30" />
              <p>No posts found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── View / Thread Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) {
            setReplyingTo(null);
            setCommentText("");
            clearFile(setCommentFile, setCommentPreview);
          }
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {selected && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-violet-400" />
                  <span className="font-bold text-white">Post Thread</span>
                  <Badge
                    className={`text-xs ${CAT_COLORS[selected.category] || CAT_COLORS.General}`}
                  >
                    {selected.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePin(selected)}
                    className={`h-8 w-8 ${selected.isPinned ? "text-violet-400" : "text-slate-400"}`}
                  >
                    {selected.isPinned ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setViewOpen(false);
                      openEdit(selected);
                    }}
                    className="h-8 w-8 text-cyan-500 hover:bg-cyan-500/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setViewOpen(false);
                      setDeleteOpen(true);
                    }}
                    className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original post */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={selected.author?.profileImage}
                      name={selected.author?.name}
                      size={10}
                    />
                    <div>
                      <p className="text-white font-semibold">
                        {selected.author?.name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {timeAgo(selected.createdAt)}
                      </p>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {selected.title}
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {selected.content}
                  </p>
                  <AttachmentPreview item={selected} />
                  <div className="flex items-center gap-4 text-slate-500 text-sm pt-1">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" /> {selected.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />{" "}
                      {selected.commentCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> {selected.viewCount}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800" />

                {/* Comments */}
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-3">
                    {selected.commentCount} Comment
                    {selected.commentCount !== 1 ? "s" : ""}
                  </p>
                  {loadingComments ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-slate-600 text-sm text-center py-6">
                      No comments yet. Be the first!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {comments.map((c) => (
                        <CommentRow key={c._id} comment={c} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Comment input — sticky at bottom */}
              <div className="border-t border-slate-800 p-4 space-y-2">
                <Textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment... (Ctrl+Enter to send)"
                  className="bg-slate-800 border-slate-700 text-white text-sm min-h-18 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                      submitComment();
                  }}
                />
                {commentPreview && (
                  <div className="relative w-24 h-16 rounded overflow-hidden border border-slate-700">
                    <Image
                      src={commentPreview}
                      alt="preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() =>
                        clearFile(setCommentFile, setCommentPreview)
                      }
                      className="absolute top-1 right-1 bg-black/60 rounded p-0.5"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                )}
                {commentFile && !commentPreview && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <FileIcon
                      type={
                        commentFile.type.startsWith("image/")
                          ? "image"
                          : "other"
                      }
                      size={4}
                    />
                    <span className="truncate max-w-50">
                      {commentFile.name}
                    </span>
                    <X
                      className="h-4 w-4 cursor-pointer hover:text-red-400"
                      onClick={() =>
                        clearFile(setCommentFile, setCommentPreview)
                      }
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-300 transition-colors">
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      accept={ACCEPT}
                      className="hidden"
                      onChange={(e) =>
                        onFileChange(e, setCommentFile, setCommentPreview)
                      }
                    />
                  </label>
                  <Button
                    disabled={
                      sendingComment || (!commentText.trim() && !commentFile)
                    }
                    onClick={() => submitComment()}
                    className="ml-auto bg-linear-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white h-9"
                  >
                    {sendingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Comment
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Create Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Post</DialogTitle>
            <DialogDescription className="text-slate-400">
              Share something with the community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label className="text-slate-300">
                Title <span className="text-red-400">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Post title..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">
                Category <span className="text-red-400">*</span>
              </Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 rounded-md bg-slate-800 border border-slate-700 text-white px-3 text-sm"
              >
                {["Network", "Fiber", "5G", "Certifications", "General"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">
                Content <span className="text-red-400">*</span>
              </Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="What's on your mind?"
                className="bg-slate-800 border-slate-700 text-white min-h-28 resize-none"
              />
            </div>
            <FilePicker
              file={file}
              preview={preview}
              onChange={(e) => onFileChange(e, setFile, setPreview)}
              onClear={() => clearFile(setFile, setPreview)}
            />
          </div>
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
              className="bg-linear-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Post</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update post content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label className="text-slate-300">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Category</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 rounded-md bg-slate-800 border border-slate-700 text-white px-3 text-sm"
              >
                {["Network", "Fiber", "5G", "Certifications", "General"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-28 resize-none"
              />
            </div>

            {/* Current attachment */}
            {selected?.attachmentUrl && !removeAttach && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <FileIcon type={selected.attachmentType} size={5} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm truncate">
                    {selected.attachmentName || "Current attachment"}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {fmt(selected.attachmentSize)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRemoveAttach(true)}
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs"
                >
                  Remove
                </Button>
                <a
                  href={selected.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
            {removeAttach && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                Attachment will be removed on save.
                <button
                  onClick={() => setRemoveAttach(false)}
                  className="ml-auto text-slate-400 hover:text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Replace / add attachment */}
            <FilePicker
              file={file}
              preview={preview}
              onChange={(e) => {
                setRemoveAttach(false);
                onFileChange(e, setFile, setPreview);
              }}
              onClear={() => clearFile(setFile, setPreview)}
              label={
                selected?.attachmentUrl ? "Replace Attachment" : "Attachment"
              }
            />
          </div>
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

      {/* ─── Delete Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500">
              Delete Post
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete{" "}
              <strong className="text-white">"{selected?.title}"</strong>? This
              will also delete all {selected?.commentCount ?? 0} comment(s) and
              any attachments. Cannot be undone.
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
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
