import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  const hasAction = actionLabel && (actionHref || onAction);

  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-charcoal p-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
      {hasAction ? (
        <div className="mt-4">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="secondary">{actionLabel}</Button>
            </Link>
          ) : (
            <Button onClick={onAction} variant="secondary">
              {actionLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
