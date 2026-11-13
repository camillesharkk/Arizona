"use client";

import { fetchAccount } from "@/lib/client-account";

import { useEffect, useState } from "react";
import { caPaths } from "@/lib/ca-site";
import { openSitting } from "@/lib/sitting";

export function CaliforniaHome({ questionCount, cardCount }: { questionCount: number; cardCount: number }) {
  const [fullLabel, setFullLabel] = useState("Start a Full Practice Exam");
  const [fullHref, setFullHref] = useState(`${caPaths.practice}?mode=full`);

  useEffect(() => {
    let owner = "guest";
    const apply = (nextOwner: string, used: boolean) => {
      const open = openSitting(sessionStorage, nextOwner, "full", "CA");
      if (open) {
        setFullLabel("Resume Full Practice Exam");
        setFullHref(`${caPaths.practice}?mode=full`);
        return;
      }
      if (used) {
        setFullLabel("Full exam limit");
        setFullHref(caPaths.pricing);
        return;
      }
      setFullLabel("Start a Full Practice Exam");
      setFullHref(`${caPaths.practice}?mode=full&start=1`);
    };
    try {
      const anon = localStorage.getItem("ca-anon-full-started") === "1";
      apply(owner, anon);
    } catch {
      apply(owner, false);
    }
    fetchAccount()
      .then((response) => response.json())
      .then((data) => {
        owner = data.user?.id || "guest";
        const used = data.user ? Number(data.user.caFullExamCount || 0) >= 1 : localStorage.getItem("ca-anon-full-started") === "1";
        apply(owner, Boolean(used));
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <section className="home-welcome" aria-label="Where to start">
        <h1>California Notary Exam Prep</h1>
      </section>
      <div className="home-copy">
        <p className="home-lead">
          Practice the California notary exam with {questionCount} published questions and {cardCount} study cards. The check uses your answers to suggest a next step. It is not an official score.
        </p>
        <p className="home-diagnostic">
          A full practice exam is 45 questions and 60 minutes. Forty items are scored. Five are unscored. The official exam needs a scaled score of at least 70, which is not a percent.
        </p>
      </div>
      <section className="home-welcome home-welcome-actions" aria-label="Start">
        <div className="home-actions-row">
          <a className="btn btn-primary" href={`${caPaths.practice}?mode=quick`}>
            Check My Knowledge — 10 Questions
          </a>
          <a className="btn btn-ghost" href={fullHref}>
            {fullLabel}
          </a>
        </div>
      </section>
    </>
  );
}
