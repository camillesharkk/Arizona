"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";

export function WrongAnswersLink({
  className,
  label = "Wrong Answers",
  href = paths.mistakes,
  stateCode = "AZ",
}: {
  className?: string;
  label?: string;
  href?: string;
  stateCode?: "AZ" | "CA";
}) {
  const [text, setText] = useState(label);
  const [to, setTo] = useState(href);

  useEffect(() => {
    let cancel = false;
    function refresh() {
      fetch("/api/auth/me/", { cache: "no-store" })
        .then((r) => r.json())
        .then(async (me) => {
          if (cancel) return;
          if (!me.user) {
            setTo(`${paths.login}?next=${encodeURIComponent(href)}`);
            setText(label);
            return;
          }
          const data = await fetch(stateCode === "CA" ? "/api/mistakes/?state=CA" : "/api/mistakes/", { cache: "no-store" }).then((r) => r.json());
          if (cancel) return;
          const due = Number(data.dueCount || 0);
          setText(due > 0 ? `${label} · ${due} due` : label);
          setTo(href);
        })
        .catch(() => undefined);
    }
    refresh();
    window.addEventListener("az-mistakes-change", refresh);
    return () => {
      cancel = true;
      window.removeEventListener("az-mistakes-change", refresh);
    };
  }, [href, label, stateCode]);

  return (
    <Link className={className} href={to}>
      {text}
    </Link>
  );
}
