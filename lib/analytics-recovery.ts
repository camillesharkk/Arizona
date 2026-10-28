import { pendingAnalyticsCheckout, recoverPendingPurchase } from "./analytics.ts";

/** Starts at mount, on checkout creation/completion, and when the user returns. */
export function observePendingPurchases() {
  let stopped = false;
  let inFlight = false;
  let attempts = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const controller = new AbortController();
  const poll = async () => {
    if (stopped || inFlight || !pendingAnalyticsCheckout()) return;
    inFlight = true;
    attempts += 1;
    let done = false;
    try {
      const res = await fetch("/api/billing/access/", { cache: "no-store", signal: controller.signal });
      if (stopped || res.status === 401) { done = true; return; }
      if (res.ok) {
        const access = await res.json();
        if (stopped) return;
        done = Array.isArray(access.orders) && recoverPendingPurchase(access.orders);
      }
    } catch { /* Analytics must not affect the page or payment. */ }
    finally {
      inFlight = false;
      if (!stopped && !done && attempts < 20) timer = setTimeout(poll, 3000);
    }
  };
  const restart = () => {
    if (timer) clearTimeout(timer);
    attempts = 0;
    void poll();
  };
  void poll();
  window.addEventListener("az:checkout-change", restart);
  window.addEventListener("focus", restart);
  window.addEventListener("storage", restart);
  return () => {
    stopped = true;
    controller.abort();
    if (timer) clearTimeout(timer);
    window.removeEventListener("az:checkout-change", restart);
    window.removeEventListener("focus", restart);
    window.removeEventListener("storage", restart);
  };
}
