import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    dateTimeStart: Date;
    dateTimeEnd: Date;
    skillLevel: string;
    weightClassMinKg: number;
    weightClassMaxKg: number;
    stancePreference: string;
    maxParticipants: number;
    gym: { name: string; plan: string };
    createdByCoach: { fullName: string; plan: string };
  };
  imageUrl?: string;
  action?: React.ReactNode;
}

export function EventCard({ event, imageUrl, action }: EventCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-44 w-full">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={event.title} className="h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-white/70">Host gym</p>
            <h3 className="text-xl font-semibold text-white">{event.gym.name}</h3>
            <p className="text-sm text-white/80">{event.title}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={event.createdByCoach.plan === "PRO" ? "premium" : "outline"}>
              {event.createdByCoach.plan === "PRO" ? "Priority" : "Standard"}
            </Badge>
            {event.gym.plan === "GYM_PRO" && <Badge variant="premium">Featured Gym</Badge>}
          </div>
        </div>
      </div>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-muted">Date</p>
            <p className="font-semibold text-white">{format(event.dateTimeStart, "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted">Time</p>
            <p className="font-semibold text-white">{format(event.dateTimeStart, "h:mm a")} - {format(event.dateTimeEnd, "h:mm a")}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted">Weight</p>
            <p className="font-semibold text-white">{event.weightClassMinKg}-{event.weightClassMaxKg} kg</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted">Skill level</p>
            <p className="font-semibold text-white">{event.skillLevel}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{event.stancePreference}</Badge>
          <Badge variant="outline">{event.maxParticipants} slots</Badge>
        </div>
        <p className="text-sm text-muted">{event.description}</p>
        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  );
}
