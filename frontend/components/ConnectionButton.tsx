"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus, Clock, UserCheck, Check, X, MessageCircle } from "lucide-react";
import { connectionsApi } from "@/lib/api";
import { toast } from "sonner";

interface ConnectionButtonProps {
  userId: string;
  className?: string;
}

type StatusData = {
  status: "none" | "pending" | "accepted" | "declined";
  connectionId?: string;
  isRequester?: boolean;
};

export default function ConnectionButton({
  userId,
  className,
}: ConnectionButtonProps) {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const dashboardSegment = pathname?.split("/").find((p) => p.endsWith("-dashboard")) || "professional-dashboard";

  const goToConversation = () => {
    router.push(`/${dashboardSegment}/messages?with=${userId}`);
  };

  const fetchStatus = async () => {
    try {
      const res = await connectionsApi.getConnectionStatus(userId);
      if (res.success) setData(res.data);
    } catch (error) {
      console.error("Failed to fetch connection status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleConnect = async () => {
    setLoading(true);
    const res = await connectionsApi.sendRequest(userId);
    setLoading(false);
    if (res.success) {
      toast.success("Connection request sent");
      fetchStatus();
    } else {
      toast.error(res.message || "Failed to send connection request");
    }
  };

  const handleRespond = async (action: "accepted" | "declined") => {
    if (!data?.connectionId) return;
    setLoading(true);
    const res = await connectionsApi.respondToRequest(data.connectionId, action);
    setLoading(false);
    if (res.success) {
      toast.success(
        action === "accepted" ? "Connection accepted" : "Request declined",
      );
      fetchStatus();
    } else {
      toast.error(res.message || "Failed to respond to request");
    }
  };

  const handleRemove = async () => {
    if (!data?.connectionId) return;
    setLoading(true);
    const res = await connectionsApi.removeConnection(data.connectionId);
    setLoading(false);
    if (res.success) {
      toast.success("Connection removed");
      fetchStatus();
    } else {
      toast.error(res.message || "Failed to remove connection");
    }
  };

  if (!data) return null;

  if (data.status === "none" || data.status === "declined") {
    return (
      <Button
        onClick={handleConnect}
        disabled={loading}
        className={className}
        size="sm"
      >
        <UserPlus className="h-4 w-4 mr-1.5" />
        Connect
      </Button>
    );
  }

  if (data.status === "pending") {
    if (data.isRequester) {
      return (
        <Button
          onClick={handleRemove}
          disabled={loading}
          variant="outline"
          size="sm"
          className={className}
        >
          <Clock className="h-4 w-4 mr-1.5" />
          Pending
        </Button>
      );
    }
    return (
      <div className={`flex items-center gap-2 ${className ?? ""}`}>
        <Button
          onClick={() => handleRespond("accepted")}
          disabled={loading}
          size="sm"
        >
          <Check className="h-4 w-4 mr-1.5" />
          Accept
        </Button>
        <Button
          onClick={() => handleRespond("declined")}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <X className="h-4 w-4 mr-1.5" />
          Decline
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <Button onClick={goToConversation} size="sm">
        <MessageCircle className="h-4 w-4 mr-1.5" />
        Message
      </Button>
      <Button onClick={handleRemove} disabled={loading} variant="outline" size="sm">
        <UserCheck className="h-4 w-4 mr-1.5" />
        Connected
      </Button>
    </div>
  );
}
