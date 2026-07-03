"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MessageSquare,
  Send,
  Circle,
  Users,
  Paperclip,
  X,
  FileText,
  Download,
} from "lucide-react";
import { messagesApi, connectionsApi } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { safeFormatDistanceToNow, downloadFile } from "@/lib/utils";

interface PublicUser {
  _id: string;
  name: string;
  profileImage?: string;
  role?: string;
  specialization?: string;
}

interface ConversationItem {
  _id: string;
  otherUser: PublicUser;
  isOnline: boolean;
  lastMessage?: { content: string; sender: string; read: boolean; createdAt: string } | null;
  lastMessageAt: string;
  unreadCount: number;
}

interface MessageAttachment {
  url: string;
  fileName?: string;
  mimeType?: string;
  fileType?: "image" | "document";
  fileSize?: number;
}

interface MessageItem {
  _id: string;
  conversation: string;
  sender: PublicUser | string;
  recipient: PublicUser | string;
  content: string;
  attachment?: MessageAttachment | null;
  read: boolean;
  createdAt: string;
}

const getId = (value: PublicUser | string | undefined) =>
  typeof value === "string" ? value : value?._id;

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [connections, setConnections] = useState<PublicUser[]>([]);
  const [startingWith, setStartingWith] = useState<string | null>(null);
  const [active, setActive] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef<ConversationItem | null>(null);
  activeRef.current = active;

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await messagesApi.getConversations();
      if (res.success) setConversations(res.data || []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await connectionsApi.getMyConnections();
      if (res.success) setConnections((res.data || []).map((c: any) => c.user));
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    }
  };

  const startConversation = async (userId: string) => {
    setStartingWith(userId);
    try {
      const res = await messagesApi.getOrCreateConversationWithUser(userId);
      if (res.success) {
        const conv: ConversationItem = {
          _id: res.data._id,
          otherUser: res.data.otherUser,
          isOnline: res.data.isOnline,
          lastMessage: null,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
        };
        setConversations((prev) => {
          const exists = prev.find((c) => c._id === conv._id);
          return exists ? prev : [conv, ...prev];
        });
        openConversation(conv);
      } else {
        toast.error(res.message || "Failed to start conversation.");
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation.");
    } finally {
      setStartingWith(null);
    }
  };

  const openConversation = async (conversation: ConversationItem) => {
    setActive(conversation);
    setMessages([]);
    setLoadingMessages(true);
    try {
      const res = await messagesApi.getMessages(conversation._id);
      if (res.success) setMessages(res.data || []);
      if (conversation.unreadCount > 0) {
        await messagesApi.markConversationAsRead(conversation._id);
        setConversations((prev) =>
          prev.map((c) => (c._id === conversation._id ? { ...c, unreadCount: 0 } : c)),
        );
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initial load + open a conversation if ?with=<userId> is provided
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setCurrentUserId(parsed.id || parsed._id);
      } catch {}
    }

    const init = async () => {
      await Promise.all([fetchConversations(), fetchConnections()]);
      const withUserId = searchParams.get("with");
      if (withUserId) startConversation(withUserId);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Socket wiring
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleReceive = (message: MessageItem) => {
      const senderId = getId(message.sender);
      const isActiveConversation = activeRef.current?._id === message.conversation;

      if (isActiveConversation) {
        setMessages((prev) => [...prev, message]);
        messagesApi.markConversationAsRead(message.conversation).catch(() => {});
      }

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === message.conversation);
        if (idx === -1) {
          fetchConversations();
          return prev;
        }
        const updated = [...prev];
        const conv = { ...updated[idx] };
        conv.lastMessage = {
          content: message.content || "📎 Attachment",
          sender: senderId || "",
          read: isActiveConversation,
          createdAt: message.createdAt,
        };
        conv.lastMessageAt = message.createdAt;
        conv.unreadCount = isActiveConversation ? 0 : conv.unreadCount + 1;
        updated.splice(idx, 1);
        updated.unshift(conv);
        return updated;
      });
    };

    const handleSent = (message: MessageItem) => {
      if (activeRef.current?._id === message.conversation) {
        setMessages((prev) =>
          prev.some((m) => m._id === message._id) ? prev : [...prev, message],
        );
      }
    };

    const handleOnline = ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    };

    const handleOffline = ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    const handleOnlineList = ({ userIds }: { userIds: string[] }) => {
      setOnlineUsers(new Set(userIds));
    };

    const handleTyping = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (activeRef.current?._id === conversationId) setTypingUserId(userId);
    };

    const handleStopTyping = ({ conversationId }: { conversationId: string }) => {
      if (activeRef.current?._id === conversationId) setTypingUserId(null);
    };

    socket.on("receive_message", handleReceive);
    socket.on("message_sent", handleSent);
    socket.on("user_online", handleOnline);
    socket.on("user_offline", handleOffline);
    socket.on("online_users", handleOnlineList);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);
    socket.on("message_error", () => toast.error("Failed to send message."));

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("message_sent", handleSent);
      socket.off("user_online", handleOnline);
      socket.off("user_offline", handleOffline);
      socket.off("online_users", handleOnlineList);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
      socket.off("message_error");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTypingChange = (value: string) => {
    setContent(value);
    const socket = getSocket();
    if (!socket || !active) return;

    socket.emit("typing", { recipientId: active.otherUser._id, conversationId: active._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { recipientId: active.otherUser._id, conversationId: active._id });
    }, 1500);
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be smaller than 10 MB.");
      e.target.value = "";
      return;
    }
    setAttachment(file);
    setAttachmentPreview(
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    );
    e.target.value = "";
  };

  const clearAttachment = () => {
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSend = async () => {
    if ((!content.trim() && !attachment) || !active || sending) return;
    const text = content.trim();
    const file = attachment;
    setContent("");
    clearAttachment();
    setSending(true);

    const socket = getSocket();
    try {
      if (file) {
        // Attachments go over HTTP (multipart); the server still delivers the
        // message to the recipient in real time via the socket.
        const res = await messagesApi.sendMessage(active._id, text, file);
        if (res.success) {
          setMessages((prev) => [...prev, res.data]);
        } else {
          toast.error(res.message || "Failed to send attachment.");
          return;
        }
      } else if (socket?.connected) {
        socket.emit("send_message", {
          conversationId: active._id,
          recipientId: active.otherUser._id,
          content: text,
        });
      } else {
        const res = await messagesApi.sendMessage(active._id, text);
        if (res.success) setMessages((prev) => [...prev, res.data]);
      }

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === active._id);
        if (idx === -1) return prev;
        const updated = [...prev];
        const conv = { ...updated[idx] };
        conv.lastMessage = {
          content: text || "📎 Attachment",
          sender: currentUserId || "",
          read: true,
          createdAt: new Date().toISOString(),
        };
        conv.lastMessageAt = new Date().toISOString();
        updated.splice(idx, 1);
        updated.unshift(conv);
        return updated;
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const conversationUserIds = new Set(conversations.map((c) => c.otherUser._id));
  const newContacts = connections.filter((u) => !conversationUserIds.has(u._id));

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation list */}
      <Card className="w-full max-w-xs flex-shrink-0 overflow-hidden bg-slate-800/50 border-slate-700 p-0">
        <div className="border-b border-slate-700 p-4">
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <MessageSquare className="h-5 w-5 text-cyan-500" /> Messages
          </h2>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100% - 57px)" }}>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
            </div>
          ) : (
            <>
              {conversations.map((conversation) => {
                const isOnline = onlineUsers.has(conversation.otherUser._id) || conversation.isOnline;
                return (
                  <button
                    key={conversation._id}
                    onClick={() => openConversation(conversation)}
                    className={`flex w-full items-center gap-3 border-b border-slate-700/70 p-3 text-left transition hover:bg-slate-700/40 ${
                      active?._id === conversation._id ? "bg-slate-700/60" : ""
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.otherUser.profileImage} />
                        <AvatarFallback className="bg-slate-700 text-white">
                          {conversation.otherUser.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Circle
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-slate-800 ${
                          isOnline ? "fill-green-500 text-green-500" : "fill-slate-500 text-slate-500"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-medium text-white">{conversation.otherUser.name}</p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="h-5 min-w-5 justify-center rounded-full bg-cyan-600 px-1 text-white">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-slate-400">
                        {conversation.lastMessage?.content || "Say hello 👋"}
                      </p>
                    </div>
                  </button>
                );
              })}

              {newContacts.length > 0 && (
                <>
                  <div className="flex items-center gap-1.5 border-b border-slate-700/70 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <Users className="h-3.5 w-3.5" /> Start a conversation
                  </div>
                  {newContacts.map((user) => {
                    const isOnline = onlineUsers.has(user._id);
                    return (
                      <button
                        key={user._id}
                        onClick={() => startConversation(user._id)}
                        disabled={startingWith === user._id}
                        className="flex w-full items-center gap-3 border-b border-slate-700/70 p-3 text-left transition hover:bg-slate-700/40 disabled:opacity-60"
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profileImage} />
                            <AvatarFallback className="bg-slate-700 text-white">
                              {user.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Circle
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-slate-800 ${
                              isOnline ? "fill-green-500 text-green-500" : "fill-slate-500 text-slate-500"
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white">{user.name}</p>
                          <p className="truncate text-sm text-slate-400">
                            {user.specialization || "Say hello 👋"}
                          </p>
                        </div>
                        {startingWith === user._id && (
                          <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {conversations.length === 0 && newContacts.length === 0 && (
                <p className="p-6 text-center text-sm text-slate-400">
                  No conversations yet. Connect with someone to start messaging.
                </p>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Chat window */}
      <Card className="flex flex-1 flex-col overflow-hidden bg-slate-800/50 border-slate-700 p-0">
        {active ? (
          <>
            <div className="flex items-center gap-3 border-b border-slate-700 p-4">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={active.otherUser.profileImage} />
                  <AvatarFallback className="bg-slate-700 text-white">
                    {active.otherUser.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Circle
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-slate-800 ${
                    onlineUsers.has(active.otherUser._id) || active.isOnline
                      ? "fill-green-500 text-green-500"
                      : "fill-slate-500 text-slate-500"
                  }`}
                />
              </div>
              <div>
                <p className="font-medium text-white">{active.otherUser.name}</p>
                <p className="text-xs text-slate-400">
                  {typingUserId === active.otherUser._id
                    ? "typing…"
                    : onlineUsers.has(active.otherUser._id) || active.isOnline
                      ? "Online"
                      : "Offline"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingMessages ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {messages.map((message) => {
                    const isMine = getId(message.sender) === currentUserId;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                            isMine
                              ? "rounded-br-sm bg-cyan-600 text-white"
                              : "rounded-bl-sm bg-slate-700 text-slate-100"
                          }`}
                        >
                          {message.attachment?.url &&
                            (message.attachment.fileType === "image" ? (
                              <a
                                href={message.attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={message.attachment.url}
                                  alt={message.attachment.fileName || "Image"}
                                  className="mb-1 max-h-60 w-full rounded-lg object-cover"
                                />
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  downloadFile(
                                    message.attachment!.url,
                                    message.attachment!.fileName,
                                  )
                                }
                                className={`mb-1 flex w-full items-center gap-2 rounded-lg p-2 text-left ${
                                  isMine ? "bg-cyan-700/60" : "bg-slate-600/60"
                                }`}
                              >
                                <FileText className="h-6 w-6 shrink-0" />
                                <span className="min-w-0 flex-1 truncate text-xs">
                                  {message.attachment.fileName || "Document"}
                                </span>
                                <Download className="h-4 w-4 shrink-0" />
                              </button>
                            ))}
                          {message.content && (
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          )}
                          <p
                            className={`mt-1 text-[10px] ${
                              isMine ? "text-cyan-100/70" : "text-slate-400"
                            }`}
                          >
                            {safeFormatDistanceToNow(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {attachment && (
              <div className="flex items-center gap-3 border-t border-slate-700 bg-slate-800/70 px-3 py-2">
                {attachmentPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachmentPreview}
                    alt="Preview"
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <FileText className="h-8 w-8 text-cyan-400" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{attachment.name}</p>
                  <p className="text-xs text-slate-400">
                    {(attachment.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearAttachment}
                  className="text-slate-400 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-slate-700 p-3">
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.ppt,.pptx"
                onChange={handleAttachmentSelect}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                title="Attach an image or document"
                className="text-slate-400 hover:text-cyan-400 hover:bg-slate-700"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                value={content}
                onChange={(e) => handleTypingChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message…"
                disabled={sending}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
              />
              <Button
                onClick={handleSend}
                disabled={sending || (!content.trim() && !attachment)}
                size="icon"
                className="bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-400">
            <MessageSquare className="h-10 w-10 text-slate-600" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </Card>
    </div>
  );
}
