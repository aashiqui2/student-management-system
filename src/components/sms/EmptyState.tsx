import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function EmptyState({
  message,
  actionLabel,
  onAction,
  icon,
}: {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon ?? <Inbox className="mb-4 h-16 w-16 text-muted-foreground/40" />}
      <h3 className="mb-1 text-lg font-semibold text-foreground/70">No Data Found</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {message ?? "There's nothing here yet."}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
