import { LIKELIHOOD_BADGE_CLASS, STATUS_BADGE_CLASS } from "@/lib/constants";
import type { Status, SubsidyLikelihood } from "@/lib/constants";

export function LikelihoodBadge({ value }: { value: SubsidyLikelihood }) {
  return (
    <span className={"badge " + LIKELIHOOD_BADGE_CLASS[value]}>{value}</span>
  );
}

export function StatusBadge({ value }: { value: Status }) {
  return <span className={"badge " + STATUS_BADGE_CLASS[value]}>{value}</span>;
}

export function SubsidyFlag({ on }: { on: boolean }) {
  if (!on) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <span className="badge bg-orange-100 text-orange-800 border-orange-200">
      ON
    </span>
  );
}
