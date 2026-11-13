"use client";

import { fetchAccount } from "@/lib/client-account";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import type { StateCode } from "@/lib/types";

export function WrongAnswersLink({
  className,
  label = "Wrong Answers",
  href = paths.mistakes,
  stateCode = "AZ",
}: {
  className?: string;
  label?: string;
  href?: string;
  stateCode?: StateCode;
}) {
  const [text, setText] = useState(label);
  const [to, setTo] = useState(href);
  const requestId = useRef(0);

  useEffect(() => {
    let cancel = false;
    setText(label);
    function refresh() {
      const id = ++requestId.current;
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Phoenix";
      const day = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      fetchAccount({ cache: "no-store" })
        .then((r) => r.json())
        .then(async (me) => {
          if (cancel || id !== requestId.current) return;
          if (!me.user) {
            setTo(`${paths.login}?next=${encodeURIComponent(href)}`);
            setText(label);
            return;
          }
          const query = `state=${stateCode}&timeZone=${encodeURIComponent(zone)}&day=${day}&account=${encodeURIComponent(me.user.id)}`;
          const data = await fetch(`/api/mistakes/?${query}`, { cache: "no-store" }).then((r) => r.json());
          if (cancel || id !== requestId.current || data.state !== stateCode || data.accountId !== me.user.id) return;
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
