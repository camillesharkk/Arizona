import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { comingSoonPath, prepStates, stateBySlug, stateLabel } from "@/lib/states";

export const dynamicParams = false;

export function generateStaticParams() {
  return prepStates.filter((state) => state.status === "comingSoon").map((state) => ({ stateSlug: state.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ stateSlug: string }> }): Promise<Metadata> {
  const state = stateBySlug((await params).stateSlug);
  if (!state || state.status !== "comingSoon") return {};
  return {
    title: { absolute: `${stateLabel(state)} Notary Prep` },
    description: `Practice questions and study materials for ${stateLabel(state)} are under development.`,
    alternates: { canonical: `${comingSoonPath(state)}` },
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: { params: Promise<{ stateSlug: string }> }) {
  const state = stateBySlug((await params).stateSlug);
  if (!state || state.status !== "comingSoon") notFound();
  const label = stateLabel(state);
  const progress = state.developmentProgress ?? 0;
  return (
    <main className="wrap">
      <h1>{label} Notary Prep</h1>
      <div className="card coming-soon-card">
        <h2>Under development</h2>
        <p>We’re building practice questions and study materials for {label}. Stay tuned!</p>
        <p id="development-progress-label">Development progress: {progress}%</p>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-labelledby="development-progress-label"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <Link className="btn btn-primary" href="/">
          Choose Another State
        </Link>
      </div>
    </main>
  );
}
