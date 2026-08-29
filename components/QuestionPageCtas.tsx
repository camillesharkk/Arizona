"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { paths } from "@/lib/paths";

export function QuestionPageCtas() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  useEffect(() => {
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="row" style={{ marginBottom: 16 }}>
      <Link className="btn btn-primary" href="#start">
        Start Questions
      </Link>
      <Link className="btn btn-ghost" href={paths.mistakes}>
        Review Wrong Answers
      </Link>
      {!user && (
        <Link className="btn btn-ghost" href={paths.register}>
          Create Free Account
        </Link>
      )}
    </div>
  );
}
