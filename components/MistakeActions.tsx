import Link from "next/link";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import type { QuestionStat } from "@/lib/store/types";

type Action = "mastered" | "favorite" | "remove" | "save";

export function MistakeActions({
  stateCode,
  studyTopic,
  stat,
  pending,
  signedIn = true,
  onAction,
}: {
  stateCode: "AZ" | "CA" | "HI";
  studyTopic?: string;
  stat?: QuestionStat | null;
  pending?: string;
  signedIn?: boolean;
  onAction: (action: Action) => void;
}) {
  const added = Boolean(stat?.savedForReview);
  return (
    <div className="row mistake-actions" aria-busy={Boolean(pending)}>
      {signedIn ? (
        <button className={`chip${added ? " on" : ""}`} type="button" disabled={Boolean(pending)} aria-pressed={added} onClick={() => onAction("save")}>
          {pending === "save" ? "Saving…" : added ? "Added to Daily Study" : "Add to Daily Study"}
        </button>
      ) : null}
      {signedIn && stat ? (
        <>
          <button className="chip" type="button" disabled={Boolean(pending) || stat.mastered} onClick={() => onAction("mastered")}>
            {pending === "mastered" ? "Saving…" : stat.mastered ? "Mastered" : "Mark mastered"}
          </button>
          <button className={`chip${stat.favorited ? " on" : ""}`} type="button" disabled={Boolean(pending)} aria-pressed={stat.favorited} onClick={() => onAction("favorite")}>
            {pending === "favorite" ? "Saving…" : stat.favorited ? "Favorited" : "Favorite"}
          </button>
          <button className="chip" type="button" disabled={Boolean(pending)} onClick={() => onAction("remove")}>
            {pending === "remove" ? "Deleting…" : "Delete record"}
          </button>
        </>
      ) : null}
      {(stateCode === "CA" || stateCode === "HI") && studyTopic ? (
        <Link className="chip" href={`${stateCode === "HI" ? hiPaths.study : caPaths.study}?chapter=${studyTopic}#${studyTopic}`}>Study This Rule</Link>
      ) : null}
      {(stateCode === "CA" || stateCode === "HI") && studyTopic ? (
        <Link className="chip" href={`${stateCode === "HI" ? hiPaths.practice : caPaths.practice}?mode=practice&area=${studyTopic}`}>Practice This Topic</Link>
      ) : null}
    </div>
  );
}
