import Link from "next/link";
import { mistakeTargets, type MistakeTarget } from "@/lib/mistake-targets";
import type { QuestionStat } from "@/lib/store/types";

type Action = "mastered" | "favorite" | "remove" | "save";

export { mistakeTargets };

function Jump({ label, target }: { label: string; target: MistakeTarget }) {
  if ('hidden' in target && target.hidden) return null;
  if ("href" in target) return <Link className="chip" href={target.href}>{label}</Link>;
  return <button className="chip" type="button" disabled>{label}</button>;
}

export function MistakeActions({
  study,
  practice,
  stat,
  pending,
  signedIn = true,
  onAction,
}: {
  study: MistakeTarget;
  practice: MistakeTarget;
  stat?: QuestionStat | null;
  pending?: string;
  signedIn?: boolean;
  onAction: (action: Action) => void;
}) {
  const added = Boolean(stat?.savedForReview);
  const busy = Boolean(pending);
  const notes = [study, practice].flatMap((item) => ("reason" in item && !item.hidden ? [item.reason] : []));
  return (
    <div className="mistake-actions" aria-busy={busy}>
      {signedIn ? (
        <button className={`chip${added ? " on" : ""}`} type="button" disabled={busy} aria-pressed={added} aria-busy={pending === "save"} onClick={() => onAction("save")}>
          {pending === "save" ? "Saving…" : added ? "Added to Daily Study" : "Add to Daily Study"}
        </button>
      ) : null}
      {signedIn && stat ? (
        <>
          <button className="chip" type="button" disabled={busy || stat.mastered} aria-busy={pending === "mastered"} onClick={() => onAction("mastered")}>
            {pending === "mastered" ? "Saving…" : stat.mastered ? "Mastered" : "Mark mastered"}
          </button>
          <button className={`chip${stat.favorited ? " on" : ""}`} type="button" disabled={busy} aria-pressed={stat.favorited} aria-busy={pending === "favorite"} onClick={() => onAction("favorite")}>
            {pending === "favorite" ? "Saving…" : stat.favorited ? "Favorited" : "Favorite"}
          </button>
          <button className="chip" type="button" disabled={busy} aria-busy={pending === "remove"} onClick={() => onAction("remove")}>
            {pending === "remove" ? "Deleting…" : "Delete record"}
          </button>
        </>
      ) : null}
      <Jump label="Study This Rule" target={study} />
      <Jump label="Practice This Topic" target={practice} />
      {notes.length ? <p className="mistake-actions-note">{notes.join(" ")}</p> : null}
    </div>
  );
}
