import type { Metadata } from "next";
import Image from "next/image";
import { StatePicker } from "@/components/StatePicker";
import { ArizonaHomeFaq } from "@/components/ArizonaHomeFaq";
import { HomeTrust } from "@/components/HomeTrust";
import { HomeCommunity } from "@/components/HomeCommunity";
import { LifetimeProOffer } from "@/components/LifetimeProOffer";
import { canonicalUrl } from "@/lib/site";
import { prepStates, statesByName } from "@/lib/states";
import { stateEntry } from "@/lib/state-entry";
import { communityInsights } from "@/data/community-insights";
import "./national-home.css";
import "./home-glass-demo.css";

export const metadata: Metadata = {
  title: { absolute: "Notary Practice Tests by State · Notary Exam Prep" },
  description:
    "Find free practice questions, answer explanations, and study guides for your state.",
  alternates: { canonical: canonicalUrl("/") },
  robots: { index: true, follow: true },
};

const steps = [
  {
    title: "Choose Your State",
    body: "Find the study tools and requirements that apply where you live.",
    icon: "state",
  },
  {
    title: "Learn and Practice",
    body: "Study the rules with your state’s available practice questions and guidance.",
    icon: "book",
  },
  {
    title: "Review and Improve",
    body: "Revisit missed questions, read explanations, and plan your next study session.",
    icon: "review",
  },
];

function StepIcon({ name }: { name: string }) {
  if (name === "book" || name === "review") {
    return (
      <Image
        className="home-step-glass-art"
        src={
          name === "book"
            ? "/images/glass-demo/study-stack.png"
            : "/images/glass-demo/study-check.png"
        }
        alt=""
        width={name === "book" ? 1536 : 1312}
        height={name === "book" ? 1024 : 1199}
        sizes="54px"
        loading="lazy"
      />
    );
  }
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M25 13c0 7-9 14-9 14S7 20 7 13a9 9 0 1 1 18 0Z" />
      <circle cx="16" cy="13" r="3" />
    </svg>
  );
}

export default function Page() {
  return (
    <main className="national-home glass-home-demo">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-container">
          <p className="home-eyebrow" data-home-enter>
            YOUR STATE. YOUR NEXT STEP.
          </p>
          <h1 id="home-title" data-home-enter>
            Pass Your Notary Exam.<span>Start Your Next Chapter.</span>
          </h1>
          <p className="home-lead" data-home-enter>
            Find practice questions, study tools, and guidance for your state.
          </p>
          <StatePicker
            indianaPreview={
              process.env.VERCEL_ENV !== "production" &&
              process.env.STATE_PREVIEW === "1"
            }
          />
          <ul
            className="home-feature-labels"
            aria-label="Study features"
            data-home-enter
          >
            <li>State-specific tools</li>
            <li>Answer explanations</li>
            <li>Study at your pace</li>
          </ul>
          <noscript>
            <style>
              {".national-home .home-state-form { display: none; }"}
            </style>
            <nav
              className="home-no-script"
              aria-label="State study destinations"
            >
              <p>Choose your state to open its study tools.</p>
              {statesByName(prepStates).map((state) => (
                <a href={stateEntry(state).href} key={state.code}>
                  {state.name} ({state.code})
                </a>
              ))}
            </nav>
          </noscript>
        </div>
      </section>
      <div className="home-container">
        <section
          className="home-section home-how"
          aria-labelledby="home-how-heading"
          data-reveal
        >
          <p className="home-eyebrow">SIMPLE STEPS, CLEAR PROGRESS</p>
          <h2 id="home-how-heading">How It Works</h2>
          <div className="home-steps">
            <svg
              className="home-step-connector"
              viewBox="0 0 900 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M80 90Q450 -60 820 90"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="8 8"
              />
            </svg>
            {steps.map((step, index) => (
              <article className="home-step" key={step.icon}>
                <div className="home-step-icon">
                  <StepIcon name={step.icon} />
                  <span>{index + 1}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>
        <HomeCommunity insights={communityInsights} />
        <HomeTrust />
        <section
          className="home-section home-lifetime"
          aria-label="Lifetime Pro"
          data-reveal
        >
          <LifetimeProOffer />
        </section>
        <ArizonaHomeFaq />
      </div>
    </main>
  );
}
