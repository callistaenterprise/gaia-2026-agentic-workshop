import { Skeleton } from "@/components/ui/skeleton";
import type { AppEvent } from "@/lib/types";
import { CalendarDays } from "lucide-react";

type Props = {
  event?: AppEvent;
  loading?: boolean;
};

export function EventCard({ event, loading }: Props) {
  if (loading) {
    return (
      <div className="p-4 border rounded space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="p-4 border rounded bg-blue-50 border-blue-200 flex gap-3">
      <CalendarDays className="mt-0.5 shrink-0 text-blue-400" size={20} />
      <div>
        <p className="font-semibold">{event.name}</p>
        <p className="text-sm text-muted-foreground">{event.date}</p>
        {event.description && (
          <p className="text-sm mt-1">{event.description}</p>
        )}
      </div>
    </div>
  );
}
