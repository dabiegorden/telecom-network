"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Users,
  Check,
  X,
  UserMinus,
  UserPlus,
  Clock,
  Loader2,
  Inbox,
  Send,
  Search,
} from "lucide-react";
import { connectionsApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface PublicUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  specialization?: string;
  profileImage?: string;
}

interface ConnectionItem {
  _id: string;
  status: string;
  connectedAt: string;
  user: PublicUser;
}

interface RequestItem {
  _id: string;
  createdAt: string;
  requester?: PublicUser;
  recipient?: PublicUser;
}

interface ConnectionMeta {
  status: "none" | "pending" | "accepted" | "declined";
  connectionId?: string;
  isRequester?: boolean;
}

interface DiscoverItem {
  user: PublicUser;
  connection: ConnectionMeta;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [incoming, setIncoming] = useState<RequestItem[]>([]);
  const [sent, setSent] = useState<RequestItem[]>([]);
  const [discover, setDiscover] = useState<DiscoverItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [connRes, reqRes, discoverRes] = await Promise.all([
        connectionsApi.getMyConnections(),
        connectionsApi.getPendingRequests(),
        connectionsApi.getDiscoverableUsers(),
      ]);
      if (connRes.success) setConnections(connRes.data || []);
      if (reqRes.success) {
        setIncoming(reqRes.data?.incoming || []);
        setSent(reqRes.data?.sent || []);
      }
      if (discoverRes.success) setDiscover(discoverRes.data || []);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleConnect = async (userId: string) => {
    setActionId(userId);
    const res = await connectionsApi.sendRequest(userId);
    setActionId(null);
    if (res.success) {
      toast.success("Connection request sent");
      fetchAll();
    } else {
      toast.error(res.message || "Failed to send connection request");
    }
  };

  const handleRespond = async (id: string, action: "accepted" | "declined") => {
    setActionId(id);
    const res = await connectionsApi.respondToRequest(id, action);
    setActionId(null);
    if (res.success) {
      toast.success(
        action === "accepted" ? "Connection accepted" : "Request declined",
      );
      fetchAll();
    } else {
      toast.error(res.message || "Failed to respond to request");
    }
  };

  const handleRemove = async (id: string, label: string) => {
    setActionId(id);
    const res = await connectionsApi.removeConnection(id);
    setActionId(null);
    if (res.success) {
      toast.success(label);
      fetchAll();
    } else {
      toast.error(res.message || "Failed to remove connection");
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const renderUserCard = (
    user: PublicUser,
    meta: string,
    actions: React.ReactNode,
  ) => (
    <Card key={user._id} className="bg-slate-800/50 border-slate-700">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-11 w-11">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback className="bg-cyan-500/10 text-cyan-400">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-white font-medium truncate">{user.name}</p>
            <p className="text-slate-400 text-sm truncate">
              {user.specialization || user.role}
            </p>
            <p className="text-slate-500 text-xs">{meta}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      </CardContent>
    </Card>
  );

  const renderDiscoverActions = (item: DiscoverItem) => {
    const { user, connection } = item;
    const busy = actionId === user._id || actionId === connection.connectionId;

    if (connection.status === "accepted") {
      return (
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
          Connected
        </Badge>
      );
    }

    if (connection.status === "pending") {
      if (connection.isRequester) {
        return (
          <Button variant="outline" size="sm" disabled className="text-slate-300">
            <Clock className="h-4 w-4 mr-1.5" />
            Pending
          </Button>
        );
      }
      return (
        <>
          <Button
            onClick={() =>
              connection.connectionId &&
              handleRespond(connection.connectionId, "accepted")
            }
            disabled={busy}
            size="sm"
          >
            <Check className="h-4 w-4 mr-1.5" />
            Accept
          </Button>
          <Button
            onClick={() =>
              connection.connectionId &&
              handleRespond(connection.connectionId, "declined")
            }
            disabled={busy}
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-1.5" />
            Decline
          </Button>
        </>
      );
    }

    return (
      <Button onClick={() => handleConnect(user._id)} disabled={busy} size="sm">
        <UserPlus className="h-4 w-4 mr-1.5" />
        Connect
      </Button>
    );
  };

  const filteredDiscover = discover.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.user.name.toLowerCase().includes(q) ||
      (item.user.specialization || "").toLowerCase().includes(q) ||
      item.user.role.toLowerCase().includes(q)
    );
  });

  const emptyState = (icon: React.ReactNode, title: string, desc: string) => (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="flex flex-col items-center justify-center py-12">
        {icon}
        <h3 className="text-xl font-semibold text-white mb-2 mt-4">{title}</h3>
        <p className="text-slate-400 text-center">{desc}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Connections</h1>
        <p className="text-slate-400 mt-1">
          Build your professional network with telecom industry peers
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      ) : (
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 h-auto p-1 flex-wrap">
            <TabsTrigger
              value="discover"
              className="gap-1.5 text-slate-300 hover:text-white data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Search className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger
              value="connections"
              className="gap-1.5 text-slate-300 hover:text-white data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              My Network
              <Badge variant="secondary" className="ml-1">
                {connections.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="incoming"
              className="gap-1.5 text-slate-300 hover:text-white data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Inbox className="h-4 w-4" />
              Requests
              {incoming.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {incoming.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="gap-1.5 text-slate-300 hover:text-white data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Send className="h-4 w-4" />
              Sent
              {sent.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {sent.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-3 mt-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search people by name, role, or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              />
            </div>
            {filteredDiscover.length === 0
              ? emptyState(
                  <Users className="h-16 w-16 text-slate-600" />,
                  "No one to discover yet",
                  "Check back later as more professionals and recruiters join the network",
                )
              : filteredDiscover.map((item) =>
                  renderUserCard(
                    item.user,
                    item.user.role === "recruiter" ? "Recruiter" : "Professional",
                    renderDiscoverActions(item),
                  ),
                )}
          </TabsContent>

          <TabsContent value="connections" className="space-y-3 mt-4">
            {connections.length === 0
              ? emptyState(
                  <Users className="h-16 w-16 text-slate-600" />,
                  "No connections yet",
                  "Start connecting with other professionals to grow your network",
                )
              : connections.map((conn) =>
                  renderUserCard(
                    conn.user,
                    `Connected ${formatDistanceToNow(new Date(conn.connectedAt), { addSuffix: true })}`,
                    <Button
                      onClick={() =>
                        handleRemove(conn._id, "Connection removed")
                      }
                      disabled={actionId === conn._id}
                      variant="outline"
                      size="sm"
                    >
                      <UserMinus className="h-4 w-4 mr-1.5" />
                      Remove
                    </Button>,
                  ),
                )}
          </TabsContent>

          <TabsContent value="incoming" className="space-y-3 mt-4">
            {incoming.length === 0
              ? emptyState(
                  <Inbox className="h-16 w-16 text-slate-600" />,
                  "No pending requests",
                  "When someone wants to connect with you, it'll show up here",
                )
              : incoming.map((req) =>
                  req.requester
                    ? renderUserCard(
                        req.requester,
                        `Requested ${formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}`,
                        <>
                          <Button
                            onClick={() => handleRespond(req._id, "accepted")}
                            disabled={actionId === req._id}
                            size="sm"
                          >
                            <Check className="h-4 w-4 mr-1.5" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRespond(req._id, "declined")}
                            disabled={actionId === req._id}
                            variant="outline"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-1.5" />
                            Decline
                          </Button>
                        </>,
                      )
                    : null,
                )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-3 mt-4">
            {sent.length === 0
              ? emptyState(
                  <Send className="h-16 w-16 text-slate-600" />,
                  "No sent requests",
                  "Connection requests you send will appear here while pending",
                )
              : sent.map((req) =>
                  req.recipient
                    ? renderUserCard(
                        req.recipient,
                        `Sent ${formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}`,
                        <Button
                          onClick={() =>
                            handleRemove(req._id, "Request withdrawn")
                          }
                          disabled={actionId === req._id}
                          variant="outline"
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-1.5" />
                          Withdraw
                        </Button>,
                      )
                    : null,
                )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
