"use client";

import { useEffect } from "react";

export function StateTheme({ state }: { state: "CT" | "CA" | "HI" | "NY" | "PA" | "LA" | "NC" | "IN" }) {
  useEffect(() => {
    document.documentElement.dataset.state = state;
  }, [state]);
  return null;
}
