"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import { pauseClarityRecording, pendingAnalyticsCheckout, rememberPendingCheckout } from "@/lib/analytics";
import { LIFETIME_PRO_PRODUCT_CODE } from "@/lib/pro-products";

const opened = new Set<string>();

export function PaddleCheckoutResume({ successOrigin }: { successOrigin: string }) {
  const [txn, setTxn] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("_ptxn") || "";
    if (!/^txn_[a-z0-9]+$/i.test(id)) return;
    setTxn(id);
    if (opened.has(id)) return;
    opened.add(id);
    const lifetime = params.get("plan") === "lifetime" || pendingAnalyticsCheckout(LIFETIME_PRO_PRODUCT_CODE)?.transactionId === id;
    let stop = () => {};
    let cancelled = false;
    let openedCheckout = false;
    let paymentSubmitted = false;
    void (async () => {
      const { PADDLE_OVERLAY_SETTINGS, loadBrowserPaddle, paddleSuccessUrl, watchPaddleCheckout } = await import(
        "@/lib/billing/paddle-browser"
      );
      if (cancelled) return;
      stop = watchPaddleCheckout((event) => {
        if (event.transactionId && event.transactionId !== id) return;
        if (event.name === "checkout.loaded") {
          setStatus("Secure checkout is open.");
        } else if (event.name === "checkout.error" || event.name === "checkout.failed") {
          setStatus("Checkout couldn't be opened. Please try again.");
        } else if (event.name === "checkout.completed") {
          paymentSubmitted = true;
          setStatus("Payment submitted. Waiting for confirmation.");
        } else if (event.name === "checkout.closed" && !paymentSubmitted) {
          setStatus("Checkout closed. You can continue the same checkout.");
        }
      });
      const paddle = await loadBrowserPaddle();
      if (cancelled) return;
      if (!paddle) {
        setStatus("Checkout is currently unavailable.");
        return;
      }
      pauseClarityRecording();
      if (lifetime) rememberPendingCheckout(id, LIFETIME_PRO_PRODUCT_CODE);
      openedCheckout = true;
      paddle.Checkout.open({
        transactionId: id,
        settings: {
          ...PADDLE_OVERLAY_SETTINGS,
          successUrl: paddleSuccessUrl(successOrigin, lifetime, id),
        },
      });
    })().catch(() => {
      if (!cancelled) setStatus("Checkout couldn't be opened. Please try again.");
    });
    return () => {
      cancelled = true;
      stop();
      if (!openedCheckout) opened.delete(id);
    };
  }, [successOrigin]);

  if (!txn) return null;
  return (
    <p className="notice wrap" role="status">
      {status || "Opening secure checkout…"}{" "}
      <Link href={paths.contact}>Contact support</Link>
    </p>
  );
}
