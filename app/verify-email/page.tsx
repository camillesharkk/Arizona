"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function Inner() {
  const params = useSearchParams();
  useEffect(() => {
    const token = params.get("token");
    if (token) window.location.href = `/api/auth/verify/?token=${encodeURIComponent(token)}`;
  }, [params]);
  return <p>Verifying email…</p>;
}

export default function VerifyEmail() {
  return (
    <main className="wrap hero">
      <h1>Email verification</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Inner />
      </Suspense>
    </main>
  );
}
