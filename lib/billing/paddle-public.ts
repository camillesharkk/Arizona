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

export function paddleSuccessUrl(origin: string) {
  return `${origin.replace(/\/$/, "")}${paddleSuccessPath()}`;
}

// Local overlay return tests: use `npm run dev`, not `npm run start`.
// `next start` sets production Secure cookies; http://localhost will not keep them after the Paddle HTTPS redirect.
