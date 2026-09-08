"use client";

import { getPaddleInstance, initializePaddle, type Environments, type Paddle } from "@paddle/paddle-js";
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

export function loadBrowserPaddle(): Promise<Paddle | undefined> {
  const existing = getPaddleInstance();
  if (existing) return Promise.resolve(existing);
  const cfg = paddleBrowserConfig();
  if (!cfg.ok) return Promise.resolve(undefined);
  if (!paddleInit) {
    paddleInit = initializePaddle({
      environment: cfg.environment,
      token: cfg.token,
    });
  }
  return paddleInit;
}
