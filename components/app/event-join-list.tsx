"use client";

import { EventJoinStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { updateEventJoinStatus } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function EventJoinList({ joins }: { joins: { id: string; fighterName: string; coachName: string; status: EventJoinStatus }[] }) {
  const router = useRouter();

  if (joins.length === 0) {
    return <p className="text-sm text-muted">No join requests yet.</p>;
  }

  const handleUpdate = async (joinId: string, status: EventJoinStatus) => {
    const result = await updateEventJoinStatus(joinId, status);
    if (!result.success) {
      toast.error(result.error ?? "Unable to update status");
      return;
    }
    toast.success("Join request updated");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {joins.map((join) => (
        <div key={join.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-charcoal p-4">
          <div>
            <p className="text-sm font-semibold text-white">{join.fighterName}</p>
            <p className="text-xs text-muted">Requested by {join.coachName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={join.status === "APPROVED" ? "success" : join.status === "DECLINED" ? "warning" : "outline"}>
              {join.status}
            </Badge>
            {join.status === "PENDING" && (
              <>
                <Button size="sm" variant="secondary" onClick={() => handleUpdate(join.id, EventJoinStatus.APPROVED)}>
                  Approve
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleUpdate(join.id, EventJoinStatus.DECLINED)}>
                  Decline
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
