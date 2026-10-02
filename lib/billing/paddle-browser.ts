"use client";

import { getPaddleInstance, initializePaddle, type Environments, type Paddle, type PaddleEventData } from "@paddle/paddle-js";
import { pauseClarityRecording, PRO_ITEM_ID, trackAnalyticsEvent } from "../analytics.ts";
import { PADDLE_OVERLAY_SETTINGS, paddleSuccessUrl } from "./paddle-public.ts";

export { PADDLE_OVERLAY_SETTINGS, paddleSuccessUrl };

function publicPaddleEnv(): Environments | null {
  const raw = String(process.env.NEXT_PUBLIC_PADDLE_ENV || "").trim().toLowerCase();
  if (raw === "sandbox" || raw === "production") return raw;
  return null;
}

function publicPaddleToken() {
  return String(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "").trim();
}

export function paddleBrowserConfig():
  | { ok: true; environment: Environments; token: string }
  | { ok: false; error: string } {
  const token = publicPaddleToken();
  const environment = publicPaddleEnv();
  if (!token || !environment) return { ok: false, error: "PADDLE_CLIENT_UNAVAILABLE" };
  return { ok: true, environment, token };
}

let paddleInit: Promise<Paddle | undefined> | null = null;

function onPaddleCheckoutEvent(event: PaddleEventData) {
  if (event?.name !== "checkout.loaded") return;
  pauseClarityRecording();
  trackAnalyticsEvent("checkout_open", { product_code: PRO_ITEM_ID, plan: "free" });
}

export function loadBrowserPaddle(): Promise<Paddle | undefined> {
  const cfg = paddleBrowserConfig();
  if (!cfg.ok) return Promise.resolve(undefined);
  const existing = getPaddleInstance();
  const ready = existing
    ? Promise.resolve(existing)
    : (paddleInit ??= initializePaddle({
        environment: cfg.environment,
        token: cfg.token,
        eventCallback: onPaddleCheckoutEvent,
      }));
  return ready.then((paddle) => {
    try {
      paddle?.Update({ eventCallback: onPaddleCheckoutEvent });
    } catch {
      /* overlay can still open; checkout_open is skipped if Paddle never reports loaded */
    }
    return paddle;
  });
}
