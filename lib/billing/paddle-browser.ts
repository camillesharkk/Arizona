"use client";

import { getPaddleInstance, initializePaddle, type Environments, type Paddle, type PaddleEventData } from "@paddle/paddle-js";
import { checkoutAttemptFor, notifyCheckoutChange, pauseClarityRecording, pendingAnalyticsCheckout, PRO_ITEM_ID, trackAnalyticsEvent, validCheckoutAttemptId } from "../analytics.ts";
import { stateByCode } from "../states.ts";
import { LIFETIME_PRO_PRODUCT_CODE } from "../pro-products.ts";
import { PADDLE_OVERLAY_SETTINGS, paddleSuccessUrl, paddleCheckoutStage } from "./paddle-public.ts";

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

export type PaddleCheckoutNotice = {
  name?: string;
  transactionId?: string;
  code?: string;
  detail?: string;
};

const checkoutWatchers = new Set<(event: PaddleCheckoutNotice) => void>();

export function watchPaddleCheckout(cb: (event: PaddleCheckoutNotice) => void) {
  checkoutWatchers.add(cb);
  return () => {
    checkoutWatchers.delete(cb);
  };
}

const checkoutEvents = new Map<string, Set<string>>();

function onPaddleCheckoutEvent(event: PaddleEventData) {
  const raw = event as PaddleEventData & { code?: string; detail?: string; data?: { code?: string; detail?: string } };
  const notice: PaddleCheckoutNotice = {
    name: event?.name,
    transactionId: event?.data?.transaction_id,
    code: raw.code || raw.data?.code,
    detail: raw.detail || raw.data?.detail,
  };
  for (const cb of checkoutWatchers) cb(notice);
  // This only requests server verification. The browser completion event is not proof of payment.
  if (event?.name === "checkout.completed") notifyCheckoutChange();
  if (event?.name === "checkout.loaded") pauseClarityRecording();
  if (!notice.transactionId) return; // Error payloads without a transaction are handled by the active overlay.
  const transactionId = notice.transactionId;
  const attempt = checkoutAttemptFor(transactionId);
  const custom = event.data?.custom_data as Record<string, unknown> | null | undefined;
  const providerAttemptId = validCheckoutAttemptId(custom?.checkout_attempt_id) ? custom.checkout_attempt_id : undefined;
  const key = attempt?.checkout_attempt_id ?? providerAttemptId ?? transactionId;
  const seen = checkoutEvents.get(key) ?? new Set<string>();
  checkoutEvents.set(key, seen);
  if (notice.name === "checkout.completed") seen.add("completed");
  const stage = paddleCheckoutStage(notice.name, seen.has("checkout_open"), seen.has("completed"));
  if (!stage || seen.has(stage)) return;
  seen.add(stage);
  const lifetime = custom?.product_code === LIFETIME_PRO_PRODUCT_CODE ||
    pendingAnalyticsCheckout(LIFETIME_PRO_PRODUCT_CODE)?.transactionId === transactionId;
  const state = typeof custom?.source_state === "string" ? stateByCode(custom.source_state)?.code : undefined;
  trackAnalyticsEvent(stage, {
    product_code: lifetime ? LIFETIME_PRO_PRODUCT_CODE : PRO_ITEM_ID,
    plan: lifetime ? "lifetime" : "pro",
    state,
    checkout_attempt_id: providerAttemptId,
    ...attempt,
    transaction_id: transactionId,
  });
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
      }).then((paddle) => {
        if (!paddle) paddleInit = null;
        return paddle;
      }, (error) => {
        paddleInit = null;
        throw error;
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
