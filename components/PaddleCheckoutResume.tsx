"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";

const opened = new Set<string>();

export function PaddleCheckoutResume({ successOrigin }: { successOrigin: string }) {
  const [txn, setTxn] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("_ptxn") || "";
    if (!/^txn_[a-z0-9]+$/i.test(id)) return;
    setTxn(id);
    if (opened.has(id)) return;
    opened.add(id);
    let stop = () => {};
    let cancelled = false;
    let openedCheckout = false;
    void (async () => {
      const { PADDLE_OVERLAY_SETTINGS, loadBrowserPaddle, paddleSuccessUrl, watchPaddleCheckout } = await import(
        "@/lib/billing/paddle-browser"
      );
      if (cancelled) return;
      stop = watchPaddleCheckout((event) => {
        if (event.name === "checkout.error" || event.name === "checkout.failed") {
          setErr("Checkout couldn't be opened. Please try again.");
        }
      });
      const paddle = await loadBrowserPaddle();
      if (cancelled) return;
      if (!paddle) {
        setErr("Checkout is currently unavailable.");
        return;
      }
      openedCheckout = true;
      paddle.Checkout.open({
        transactionId: id,
        settings: {
          ...PADDLE_OVERLAY_SETTINGS,
          successUrl: paddleSuccessUrl(successOrigin),
        },
      });
    })();
    return () => {
      cancelled = true;
      stop();
      if (!openedCheckout) opened.delete(id);
    };
  }, [successOrigin]);

  if (!txn) return null;
  return (
    <p className="notice wrap">
      {err ? `${err} ` : "Secure checkout is open. "}
      <Link href={paths.contact}>Contact support</Link>
    </p>
  );
}
