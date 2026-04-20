import { Skeleton } from "@/components/ui/skeleton";
import type { Participant } from "@/lib/types";
import { UserRound } from "lucide-react";

type Props = {
  participant?: Participant;
  loading?: boolean;
};

export function ParticipantCard({ participant, loading }: Props) {
  if (loading) {
    return (
      <div className="p-4 border rounded space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    );
  }

  if (!participant) return null;

  return (
    <div className="p-4 border rounded bg-green-50 border-green-200 flex gap-3">
      <UserRound className="mt-0.5 shrink-0 text-green-500" size={20} />
      <div>
        <p className="font-semibold">{participant.firstName} {participant.lastName}</p>
        {participant.snackPreference && (
          <p className="text-sm text-muted-foreground">Snack preference: {participant.snackPreference}</p>
        )}
      </div>
    </div>
  );
}
