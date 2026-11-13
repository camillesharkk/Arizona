import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { StateTheme } from "@/components/StateTheme";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";
import Link from "next/link";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA", "north-carolina": "NC", connecticut: "CT" };

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ state: string }> }) {
  if (process.env.VERCEL_ENV === "production" || process.env.STATE_PREVIEW !== "1") notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  return (
    <div data-state={code}>
      <StateTheme state={code} />
      <p className="notice wrap">Preview only. {prepPacks[code].name} is not a public offering and is not in the state list.</p>
      <nav className="wrap" aria-label="Preview states"><Link href="/preview/pennsylvania/">Pennsylvania preview</Link>{" · "}<Link href="/preview/louisiana/">Louisiana preview</Link></nav>
      {children}
    </div>
  );
}
