import { PageHeader } from "@/components/app/page-header";
import { EventCreateForm } from "@/components/app/event-create-form";
import { Card, CardContent } from "@/components/ui/card";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create event"
        description="Host a sparring session for your gym or invite external partners."
      />
      <Card>
        <CardContent>
          <EventCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
