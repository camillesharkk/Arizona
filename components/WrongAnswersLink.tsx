"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";

export function WrongAnswersLink({
  className,
  label = "Wrong Answers",
  href = paths.mistakes,
}: {
  className?: string;
  label?: string;
  href?: string;
}) {
  const [text, setText] = useState(label);
  const [to, setTo] = useState(href);

  useEffect(() => {
    let cancel = false;
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then(async (me) => {
        if (cancel) return;
        if (!me.user) {
          setTo(`${paths.login}?next=${encodeURIComponent(href)}`);
          setText(label);
          return;
        }
        const data = await fetch("/api/mistakes/").then((r) => r.json());
        if (cancel) return;
        const due = Number(data.dueCount || 0);
        setText(due > 0 ? `${label} · ${due} due` : label);
        setTo(href);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [href, label]);

  return (
    <Link className={className} href={to}>
      {text}
    </Link>
  );
}
