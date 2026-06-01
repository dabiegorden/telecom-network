"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Pin,
  Search,
  Filter,
  MoreVertical,
  Send,
  Image as ImageIcon,
  FileText,
  Download,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
  Reply,
  Paperclip,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  specialization?: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: User;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentMime?: string;
  likes: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  _id: string;
  post: string;
  user: User;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  likes: string[];
  likeCount: number;
  replyCount: number;
  parentComment?: string;
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

const CATEGORIES = [
  "All",
  "Network",
  "Fiber",
  "5G",
  "Certifications",
  "General",
];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
];

const ProfessionalPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Comment states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentAttachment, setCommentAttachment] = useState<File | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set(),
  );
  const [replies, setReplies] = useState<{ [key: string]: Comment[] }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchPosts();
  }, [selectedCategory, sortBy, searchQuery, currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sort: sortBy,
      });

      if (selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`${API}/posts?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
        setTotalPages(data.pages);
      }
    } catch (error) {
      toast.error("Failed to fetch posts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likeCount: data.likeCount,
                  likes: data.liked
                    ? [...post.likes, currentUser._id]
                    : post.likes.filter((id) => id !== currentUser._id),
                }
              : post,
          ),
        );
      }
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleSharePost = (post: Post) => {
    const shareUrl = `${window.location.origin}/posts/${post._id}`;

    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100) + "...",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const openCommentsDialog = async (post: Post) => {
    setSelectedPost(post);
    setShowCommentsDialog(true);
    await fetchComments(post._id);
  };

  const fetchComments = async (postId: string) => {
    try {
      setLoadingComments(true);
      const response = await fetch(`${API}/posts/${postId}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchReplies = async (postId: string, commentId: string) => {
    try {
      const response = await fetch(
        `${API}/posts/${postId}/comments/${commentId}/replies`,
      );
      const data = await response.json();

      if (data.success) {
        setReplies((prev) => ({ ...prev, [commentId]: data.data }));
      }
    } catch (error) {
      console.error("Failed to fetch replies");
    }
  };

  const toggleReplies = async (commentId: string, postId: string) => {
    if (expandedComments.has(commentId)) {
      setExpandedComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      await fetchReplies(postId, commentId);
      setExpandedComments((prev) => new Set(prev).add(commentId));
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() && !commentAttachment) {
      toast.error("Please enter a comment or attach a file");
      return;
    }

    try {
      setSubmittingComment(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", commentText);

      if (commentAttachment) {
        formData.append("attachment", commentAttachment);
      }

      if (replyingTo) {
        formData.append("parentComment", replyingTo);
      }

      const response = await fetch(
        `${API}/posts/${selectedPost?._id}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Comment added successfully");
        setCommentText("");
        setCommentAttachment(null);
        setReplyingTo(null);
        setReplyText("");
        await fetchComments(selectedPost!._id);

        // Update comment count in posts list
        setPosts((prev) =>
          prev.map((post) =>
            post._id === selectedPost?._id
              ? { ...post, commentCount: post.commentCount + 1 }
              : post,
          ),
        );
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API}/posts/${selectedPost?._id}/comments/${commentId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? { ...comment, likeCount: data.likeCount }
              : comment,
          ),
        );

        // Update replies if the liked comment is a reply
        setReplies((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            updated[key] = updated[key].map((reply) =>
              reply._id === commentId
                ? { ...reply, likeCount: data.likeCount }
                : reply,
            );
          });
          return updated;
        });
      }
    } catch (error) {
      toast.error("Failed to like comment");
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

  const getAttachmentIcon = (type?: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "pdf":
      case "document":
      case "spreadsheet":
        return <FileText className="h-4 w-4" />;
      default:
        return <Paperclip className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Community Posts</h1>
            <p className="text-slate-400 mt-1">
              Connect, learn, and share with telecom professionals
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500 focus:ring-cyan-500/20">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className="text-slate-200 focus:bg-slate-700 focus:text-white"
                  >
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="md:col-span-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white focus:border-cyan-500 focus:ring-cyan-500/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-slate-200 focus:bg-slate-700 focus:text-white"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      ) : posts.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No posts found
            </h3>
            <p className="text-slate-400 text-center">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post._id}
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-10 w-10 border-2 border-cyan-500">
                      <AvatarImage
                        src={post.author.profileImage}
                        alt={post.author.name}
                      />
                      <AvatarFallback className="bg-linear-to-br from-cyan-500 to-blue-500 text-white font-semibold">
                        {post.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">
                          {post.author.name}
                        </h3>
                        {post.author.specialization && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-slate-700/50 text-slate-300 border-slate-600"
                          >
                            {post.author.specialization}
                          </Badge>
                        )}
                        {post.isPinned && (
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(post.category)}>
                    {post.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    {post.title}
                  </h2>
                  <p className="text-slate-300 whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Attachment */}
                {post.attachmentUrl && (
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getAttachmentIcon(post.attachmentType)}
                        <div>
                          <p className="text-sm font-medium text-white">
                            {post.attachmentName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {post.attachmentType?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={post.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                    {post.attachmentType === "image" && (
                      <img
                        src={post.attachmentUrl}
                        alt={post.attachmentName}
                        className="mt-4 rounded-lg max-h-96 w-full object-cover"
                      />
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-slate-700 pt-4">
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikePost(post._id)}
                    className={`text-slate-400 hover:text-white hover:bg-slate-700 ${
                      post.likes.includes(currentUser?._id)
                        ? "text-red-400"
                        : ""
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${
                        post.likes.includes(currentUser?._id)
                          ? "fill-current"
                          : ""
                      }`}
                    />
                    {post.likeCount}
                  </Button>

                  {/* Comment Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openCommentsDialog(post)}
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {post.commentCount}
                  </Button>

                  {/* View Count */}
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Eye className="h-4 w-4" />
                    {post.viewCount}
                  </div>
                </div>

                {/* Share Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSharePost(post)}
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            Previous
          </Button>
          <span className="text-slate-400 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            Next
          </Button>
        </div>
      )}

      {/* Comments Dialog */}
      <Dialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Comments</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedPost?.title}
            </DialogDescription>
          </DialogHeader>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {loadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="space-y-3">
                  {/* Main Comment */}
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 border-2 border-cyan-500">
                        <AvatarImage
                          src={comment.user.profileImage}
                          alt={comment.user.name}
                        />
                        <AvatarFallback className="bg-linear-to-br from-cyan-500 to-blue-500 text-white text-xs font-semibold">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">
                          {comment.content}
                        </p>

                        {/* Comment Attachment */}
                        {comment.attachmentUrl && (
                          <div className="mt-2 bg-slate-900/50 border border-slate-700 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              {getAttachmentIcon(comment.attachmentType)}
                              <a
                                href={comment.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-cyan-400 hover:text-cyan-300 flex-1 truncate"
                              >
                                {comment.attachmentName}
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Comment Actions */}
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                            className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1"
                          >
                            <Heart className="h-3 w-3" />
                            {comment.likeCount}
                          </button>
                          <button
                            onClick={() => setReplyingTo(comment._id)}
                            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                          >
                            <Reply className="h-3 w-3" />
                            Reply
                          </button>
                          {comment.replyCount > 0 && (
                            <button
                              onClick={() =>
                                toggleReplies(comment._id, selectedPost!._id)
                              }
                              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                              {expandedComments.has(comment._id) ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                              {comment.replyCount}{" "}
                              {comment.replyCount === 1 ? "reply" : "replies"}
                            </button>
                          )}
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment._id && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              className="bg-slate-900 border-slate-700 text-white text-sm min-h-15"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setCommentText(replyText);
                                  handleSubmitComment();
                                }}
                                disabled={
                                  !replyText.trim() || submittingComment
                                }
                                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                              >
                                {submittingComment ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Send className="h-3 w-3 mr-1" />
                                    Reply
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {expandedComments.has(comment._id) &&
                    replies[comment._id] && (
                      <div className="ml-12 space-y-3">
                        {replies[comment._id].map((reply) => (
                          <div
                            key={reply._id}
                            className="bg-slate-800/30 rounded-lg p-3"
                          >
                            <div className="flex items-start gap-2">
                              <Avatar className="h-6 w-6 border border-cyan-500">
                                <AvatarImage
                                  src={reply.user.profileImage}
                                  alt={reply.user.name}
                                />
                                <AvatarFallback className="bg-linear-to-br from-cyan-500 to-blue-500 text-white text-xs">
                                  {reply.user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-xs">
                                    {reply.user.name}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {formatDistanceToNow(
                                      new Date(reply.createdAt),
                                      { addSuffix: true },
                                    )}
                                  </span>
                                </div>
                                <p className="text-slate-300 text-xs">
                                  {reply.content}
                                </p>
                                <button
                                  onClick={() => handleLikeComment(reply._id)}
                                  className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 mt-1"
                                >
                                  <Heart className="h-3 w-3" />
                                  {reply.likeCount}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="border-t border-slate-700 pt-4 space-y-3">
            {commentAttachment && (
              <div className="bg-slate-800 rounded-lg p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Paperclip className="h-4 w-4" />
                  <span className="truncate">{commentAttachment.name}</span>
                </div>
                <button
                  onClick={() => setCommentAttachment(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="bg-slate-800 border-slate-700 text-white flex-1"
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <input
                  type="file"
                  id="comment-attachment"
                  className="hidden"
                  onChange={(e) =>
                    setCommentAttachment(e.target.files?.[0] || null)
                  }
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                />
                <label htmlFor="comment-attachment">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={() =>
                      document.getElementById("comment-attachment")?.click()
                    }
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                </label>
              </div>
              <Button
                onClick={handleSubmitComment}
                disabled={
                  (!commentText.trim() && !commentAttachment) ||
                  submittingComment
                }
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Post Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalPostsPage;
