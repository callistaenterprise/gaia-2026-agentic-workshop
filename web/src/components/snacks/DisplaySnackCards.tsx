import type { Snack } from "@/lib/types";
import { SnackTable } from "./SnackTable";

type Props = {
  snacks: Snack[];
  loading: boolean;
};

export function DisplaySnackCards({ snacks, loading }: Props) {
  if (!loading && snacks.length === 0) {
    return (
      <div className="p-4 border rounded text-muted-foreground">
        No snacks found.
      </div>
    );
  }

  return <SnackTable snacks={snacks} loading={loading} />;
}
