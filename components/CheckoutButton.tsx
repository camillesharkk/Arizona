"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { paths } from "@/lib/paths";

export function CheckoutButton() {
  const [err, setErr] = useState("");
  const params = useSearchParams();
  useEffect(() => {
    if (params.get("checkout") === "mock") {
      window.location.href = "/api/billing/checkout/?mock=success";
    }
  }, [params]);
  async function go() {
    const res = await fetch("/api/billing/checkout/", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Sign in first");
      return;
    }
    window.location.href = data.url;
  }
  return (
    <div>
      <button className="btn btn-primary" type="button" onClick={go}>
        Continue to checkout
      </button>
      {err && (
        <p className="notice">
          {err}. <Link href={paths.login}>Sign in</Link>
        </p>
      )}
    </div>
  );
}
