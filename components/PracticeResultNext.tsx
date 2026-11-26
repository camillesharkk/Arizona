"use client";

import { useId, type ReactNode } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { LIFETIME_PRO_PRODUCT_CODE, SITE_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import { PRO_DURATION_DAYS } from "@/lib/pricing/catalog";
import type { PracticeDiagnosis, PracticeResultOffer } from "@/lib/practice-result";
import styles from "./PracticeResultNext.module.css";

export function PracticeResultNext({ diagnosis, guide, pricing, offer, analytics, children }: {
  diagnosis: PracticeDiagnosis;
  guide: string;
  pricing: string;
  offer: PracticeResultOffer | null;
  analytics: Record<string, string | number | boolean>;
  children?: ReactNode;
}) {
  const heading = useId();
  const membership = useId();
  const highlight = diagnosis.topics.find(topic => topic.missed > 0);
  const target = diagnosis.firstMissedId ? `#review-${diagnosis.firstMissedId}` : guide;
  const pending = diagnosis.status === "pending" || diagnosis.status === "unavailable";

  return <>
    <section className={styles.panel} aria-labelledby={heading} data-notary-white-canvas>
      <h3 id={heading}>Topic results</h3>
      {diagnosis.status === "unanswered" && <p>No questions were answered in this practice.</p>}
      {diagnosis.status === "all-correct" && <p>You got every answered question right in this practice.</p>}
      {pending && <p>Topic feedback is unavailable for this result. You can continue with the free study guide.</p>}
      {highlight && <p>You missed {highlight.missed} of {highlight.answered} answered {highlight.answered === 1 ? "question" : "questions"} on <strong>{highlight.label}</strong>.</p>}
      {diagnosis.topics.length > 0 && <dl className={styles.topics}>
        {diagnosis.topics.map(topic => <div key={topic.id}>
          <dt>{topic.label}</dt>
          <dd>{topic.answered} answered · {topic.correct} correct · {topic.missed} missed</dd>
        </div>)}
      </dl>}
      {diagnosis.unmapped > 0 && <p>{diagnosis.unmapped} answered {diagnosis.unmapped === 1 ? "question has" : "questions have"} no topic assigned.</p>}
      {!pending && diagnosis.skipped > 0 && <p>Unanswered: {diagnosis.skipped}</p>}
      {diagnosis.unscored > 0 && <p>Topic totals include answered unscored items for study feedback.</p>}
      <div className="result-next">
        <a className="btn btn-primary" href={target} onClick={() => trackAnalyticsEvent("result_next_click", {
          ...analytics,
          next_step: diagnosis.firstMissedId ? "missed_explanations" : "guide",
          ...(highlight && { topic: highlight.id }),
        })}>{diagnosis.firstMissedId ? "Review missed explanations" : "Open the free study guide"}</a>
      </div>
      {children && <div className={styles.links}>{children}</div>}
    </section>
    {offer && <section className={styles.panel} aria-labelledby={membership}>
      <h3 id={membership}>Keep practicing with Pro</h3>
      <p>{PRO_DURATION_DAYS}-Day Pro opens {offer.extraQuestions} more questions in this state. {highlight ? "Use the full bank to revisit the rules that came up in this set." : "Use the full bank to practice more scenarios."}</p>
      <div className="result-next">
        <a className="btn btn-ghost" href={`${pricing}#pro-checkout`}
          data-upgrade-source="result_60_day" data-upgrade-product={SITE_PRO_PRODUCT_CODE}
          data-upgrade-mode={analytics.mode} data-upgrade-question-count={analytics.question_count} data-upgrade-state={analytics.state}>
          See {PRO_DURATION_DAYS}-Day Pro
        </a>
        <a href={`${pricing}#lifetime-checkout`}
          data-upgrade-source="result_lifetime" data-upgrade-product={LIFETIME_PRO_PRODUCT_CODE}
          data-upgrade-mode={analytics.mode} data-upgrade-question-count={analytics.question_count} data-upgrade-state={analytics.state}>
          Compare Lifetime Pro
        </a>
      </div>
    </section>}
  </>;
}
