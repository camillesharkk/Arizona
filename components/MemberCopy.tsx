"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const MemberCopyContext = createContext(false);
const SetMemberCopyContext = createContext<(value: boolean) => void>(() => {});

export function MemberCopyProvider({ children }: { children: ReactNode }) {
  const [hasPro, setHasPro] = useState(false);
  return (
    <SetMemberCopyContext.Provider value={setHasPro}>
      <MemberCopyContext.Provider value={hasPro}>{children}</MemberCopyContext.Provider>
    </SetMemberCopyContext.Provider>
  );
}

export function useSetMemberCopy() {
  return useContext(SetMemberCopyContext);
}

export function MemberCopy({ children, member }: { children: ReactNode; member: ReactNode }) {
  return useContext(MemberCopyContext) ? member : children;
}
