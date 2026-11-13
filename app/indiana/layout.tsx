import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prepPageEnabled } from "@/lib/state-release";
export const metadata = { robots: { index: false, follow: false } };
export default function Layout({ children }: { children: ReactNode }) {
  if (!prepPageEnabled("indiana")) notFound();
  return <div data-state="IN"><p className="notice wrap" role="note">Indiana candidate preview · Independent study practice</p>{children}</div>;
}
