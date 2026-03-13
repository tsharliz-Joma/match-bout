"use client";

import { SparRequestStatus } from "@prisma/client";
import { respondSparRequest } from "@/lib/actions/requests";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SparRequestItem {
  id: string;
  fromCoachName: string;
  toCoachName: string;
  proposedDateTime: string;
  message: string;
  fighters: string[];
  proposedGym: string;
  status: SparRequestStatus;
  direction: "incoming" | "outgoing";
}

export function SparRequestList({ requests }: { requests: SparRequestItem[] }) {
  if (requests.length === 0) {
    return <p className="text-sm text-muted">No spar requests yet.</p>;
  }

  const handleRespond = async (id: string, status: SparRequestStatus, createEvent?: boolean) => {
    const result = await respondSparRequest(id, status, createEvent);
    if (!result.success) {
      toast.error(result.error ?? "Unable to update request");
      return;
    }
    toast.success("Request updated");
    window.location.reload();
  };

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div key={request.id} className="rounded-lg border border-white/10 bg-charcoal p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                {request.direction === "incoming" ? request.fromCoachName : request.toCoachName}
              </p>
              <p className="text-xs text-muted">{request.proposedDateTime}</p>
            </div>
            <Badge variant={request.status === "ACCEPTED" ? "success" : request.status === "DECLINED" ? "warning" : "outline"}>
              {request.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-white/80">{request.message}</p>
          <p className="mt-2 text-xs text-muted">Proposed location: {request.proposedGym}</p>
          {request.fighters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
              {request.fighters.map((fighter) => (
                <Badge key={fighter} variant="outline">
                  {fighter}
                </Badge>
              ))}
            </div>
          )}
          {request.direction === "incoming" && request.status === "PENDING" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => handleRespond(request.id, SparRequestStatus.ACCEPTED, false)}>
                Accept
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleRespond(request.id, SparRequestStatus.ACCEPTED, true)}>
                Accept + create event
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleRespond(request.id, SparRequestStatus.DECLINED)}>
                Decline
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
