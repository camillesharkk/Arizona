export const PADDLE_OVERLAY_SETTINGS = {
  displayMode: "overlay" as const,
  variant: "one-page" as const,
  theme: "light" as const,
  locale: "en",
  showAddDiscounts: false,
};

export function paddleSuccessPath() {
  return "/dashboard/?checkout=success";
}

export function lifetimeReturnTransaction(params: URLSearchParams) {
  const id = params.get("txn") || "";
  return /^txn_[a-z0-9]{1,64}$/i.test(id) ? id : null;
}

export function paddleSuccessUrl(origin: string, lifetime = false, transactionId?: string) {
  const url = new URL(paddleSuccessPath(), origin);
  if (lifetime) {
    url.searchParams.set("plan", "lifetime");
    if (transactionId) url.searchParams.set("txn", transactionId);
  }
  return url.toString();
}

/** Paddle only opens checkout from the account's approved payment-link host. */
export function paddleCheckoutFallback(
  checkoutUrl: string | null | undefined,
  transactionId: string,
  currentHost: string,
  lifetime = false,
): string | null {
  if (!checkoutUrl || !transactionId || !currentHost) return null;
  let url: URL;
  try {
    url = new URL(checkoutUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.host === currentHost) return null;
  const bound = url.searchParams.get("_ptxn");
  if (bound && bound !== transactionId) return null;
  if (!bound) url.searchParams.set("_ptxn", transactionId);
  if (lifetime) url.searchParams.set("plan", "lifetime");
  return url.toString();
}

// Local overlay return tests: use `npm run dev`, not `npm run start`.
// `next start` sets production Secure cookies; http://localhost will not keep them after the Paddle HTTPS redirect.
