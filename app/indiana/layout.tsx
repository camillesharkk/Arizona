import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prepPageEnabled } from "@/lib/state-release";
export const metadata = { robots: { index: true, follow: true } };
export default function Layout({ children }: { children: ReactNode }) {
  if (!prepPageEnabled("indiana")) notFound();
  return <div data-state="IN">{children}</div>;
}
