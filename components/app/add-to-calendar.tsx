"use client";

import { Button } from "@/components/ui/button";

type AddToCalendarProps = {
  event: {
    id: string;
    title: string;
    description: string;
    dateTimeStart: Date | string;
    dateTimeEnd: Date | string;
    gym: {
      name: string;
      address?: string | null;
      suburb?: string | null;
      state?: string | null;
      country?: string | null;
    };
  };
};

function toDate(value: Date | string) {
  return typeof value === "string" ? new Date(value) : value;
}

function formatGoogleDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function buildLocation(gym: AddToCalendarProps["event"]["gym"]) {
  return [gym.name, gym.address, gym.suburb, gym.state, gym.country].filter(Boolean).join(", ");
}

export function AddToCalendar({ event }: AddToCalendarProps) {
  const start = toDate(event.dateTimeStart);
  const end = toDate(event.dateTimeEnd);
  const location = buildLocation(event.gym);
  const details = `${event.description}\n\nView in SparConnect: /app/events/${event.id}`;

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}`;

  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
    event.title
  )}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&startdt=${encodeURIComponent(
    start.toISOString()
  )}&enddt=${encodeURIComponent(end.toISOString())}`;

  return (
    <div className="flex flex-wrap gap-2">
      <a href={`/app/events/${event.id}/calendar`}>
        <Button variant="secondary">Apple Calendar (.ics)</Button>
      </a>
      <a href={googleUrl} target="_blank" rel="noreferrer">
        <Button variant="outline">Google Calendar</Button>
      </a>
      <a href={outlookUrl} target="_blank" rel="noreferrer">
        <Button variant="outline">Outlook</Button>
      </a>
    </div>
  );
}
