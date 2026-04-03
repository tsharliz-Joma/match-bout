"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitEventReview } from "@/lib/actions/reviews";
import { toast } from "sonner";

export function EventReviewForm({ eventId }: { eventId: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    setLoading(true);
    const result = await submitEventReview({ eventId, rating, body });
    setLoading(false);
    if (result.success) {
      toast.success("Review submitted");
    } else {
      toast.error(result.error ?? "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm text-muted">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-2xl leading-none transition-colors"
            >
              <span className={(hovered || rating) >= star ? "text-ember" : "text-white/20"}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Textarea
          placeholder="How did the session go? Be specific — gyms and coaches rely on honest feedback."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
