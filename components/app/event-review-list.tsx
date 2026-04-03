import { formatDistanceToNow } from "date-fns";

type Review = {
  id: string;
  rating: number;
  body: string;
  createdAt: Date;
  authorCoach: { fullName: string };
};

export function EventReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted">No reviews yet. Be the first to leave one.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border border-white/10 bg-charcoal p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">{review.authorCoach.fullName}</p>
            <div className="flex items-center gap-2">
              <span className="text-ember">{"★".repeat(review.rating)}<span className="text-white/20">{"★".repeat(5 - review.rating)}</span></span>
              <span className="text-xs text-muted">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm text-white/80">{review.body}</p>
        </div>
      ))}
    </div>
  );
}
