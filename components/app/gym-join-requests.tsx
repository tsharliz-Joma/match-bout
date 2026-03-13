"use client";

import { approveJoinRequest, declineJoinRequest } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function GymJoinRequests({ requests }: { requests: { id: string; coachName: string; coachEmail: string; status: string }[] }) {
  if (requests.length === 0) {
    return <p className="text-sm text-muted">No join requests.</p>;
  }

  const handleApprove = async (id: string) => {
    const result = await approveJoinRequest(id);
    if (!result.success) {
      toast.error(result.error ?? "Unable to approve");
      return;
    }
    toast.success("Coach approved");
    window.location.reload();
  };

  const handleDecline = async (id: string) => {
    const result = await declineJoinRequest(id);
    if (!result.success) {
      toast.error(result.error ?? "Unable to decline");
      return;
    }
    toast.success("Coach declined");
    window.location.reload();
  };

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-charcoal p-4">
          <div>
            <p className="text-sm font-semibold text-white">{request.coachName}</p>
            <p className="text-xs text-muted">{request.coachEmail}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => handleApprove(request.id)}>Approve</Button>
            <Button size="sm" variant="ghost" onClick={() => handleDecline(request.id)}>Decline</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
