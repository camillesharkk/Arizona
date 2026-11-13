"use client";

import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { pathState, resolveState, writeStateCookie, type LiveCode } from "@/lib/site-state";

const SavedStateContext = createContext<LiveCode | null>(null);

export function SavedStateProvider({ value, children }: { value: LiveCode | null; children: ReactNode }) {
  return <SavedStateContext.Provider value={value}>{children}</SavedStateContext.Provider>;
}

export function useSavedState() {
  return useContext(SavedStateContext);
}

export function useResolvedState(savedState: LiveCode | null) {
  const pathname = usePathname() || "";
  const [saved, setSaved] = useState(savedState);
  useLayoutEffect(() => {
    const fromPath = pathState(pathname);
    if (fromPath) writeStateCookie(fromPath);
    const match = document.cookie.match(/(?:^|; )np_state=(AZ|CA|HI|NY|PA|LA|CT|NC|IN)/);
    const remembered = match?.[1] === "AZ" || match?.[1] === "CA" || match?.[1] === "HI" || match?.[1] === "NY" || match?.[1] === "PA" || match?.[1] === "LA" || match?.[1] === "CT" || match?.[1] === "NC" || match?.[1] === "IN" ? match[1] : savedState;
    setSaved(fromPath ?? remembered);
  }, [pathname, savedState]);
  return resolveState(pathname, saved);
}
