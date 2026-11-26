import type { Metadata } from "next";
import Link from "next/link";
import { StatePicker } from "@/components/StatePicker";
import { EditorialHomeCommunity } from "@/components/EditorialHomeCommunity";
import { EditorialHomePlans } from "@/components/EditorialHomePlans";
import { HomeLearning, HomeSample, type SampleQuestion } from "@/components/HomeSample";
import { JsonLd, faqJson } from "@/components/JsonLd";
import { canonicalUrl } from "@/lib/site";
import { paths } from "@/lib/paths";
import { prepStates, stateByCode, statesByName } from "@/lib/states";
import { stateEntry } from "@/lib/state-entry";
import { communityInsights, communityInsightsUpdatedAt, homepageCommunityInsights } from "@/data/community-insights";
import { publishedNyQuestions } from "@/data/ny-content";
import { guarantee } from "@/lib/pricing/membership-benefits";
import { PRO_DURATION_DAYS } from "@/lib/pricing/catalog";
import "./national-home.css";
import "./editorial-home.css";

export const metadata: Metadata = {
  title: { absolute: "Notary Practice Tests by State · Notary Exam Prep" },
  description:
    "Find free practice questions, answer explanations, and study guides for your state.",
  alternates: { canonical: canonicalUrl("/") },
  robots: { index: true, follow: true },
};

const faqs = [
  { q: "What can I try for free?", a: "Choose your state to find free practice questions, explanations and study resources where available. Available tools vary by state." },
  { q: "How are the two Pro plans different?", a: `60-Day Pro provides ${PRO_DURATION_DAYS} days of access across available states. Lifetime Pro has no expiration and includes a separate official exam guarantee fee.`, href: paths.pricing, label: "Compare plans" },
  { q: "Will my membership renew automatically?", a: "Both Pro plans are one-time purchases. Neither renews automatically.", href: paths.terms, label: "Terms of use" },
  { q: "What are Community Insights?", a: "Our editors use public discussions to identify study topics and cite official sources for the rules. You can also join the separate on-site discussion.", href: paths.community, label: "Explore Community Insights" },
  { q: "How does the Lifetime Pro exam guarantee work?", a: `If you fail a qualifying official notary exam taken after purchase, request a refund of the ${guarantee} guarantee fee within 30 days of the official result. Provide your order number, exam and result dates, and official proof. Lifetime Pro stays active.`, href: paths.refund + "#lifetime", label: "Read the full refund terms" },
];

function getSampleQuestion(): SampleQuestion {
  const item = publishedNyQuestions().find(question => question.question_id === "ny-008" && question.is_free);
  if (!item) throw new Error("The reviewed New York homepage sample must remain free.");
  const options = [item.option_a, item.option_b, item.option_c, item.option_d];
  return {
    text: item.question_text,
    options,
    correct: ["A", "B", "C", "D"].indexOf(item.correct_option),
    reason: item.explanation,
    feedback: (["A", "B", "C", "D"] as const).map(option => item.option_feedback?.[option] ?? ""),
    verified: item.last_verified_at,
  };
}

const insightsByState = new Map(homepageCommunityInsights.map(item => [item.state, item]));
for (const item of [...communityInsights].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
  if (!insightsByState.has(item.state)) insightsByState.set(item.state, item);
}
const featuredInsights = [...insightsByState.values()].map(item => ({
  id: item.id, state: item.state, title: item.title, summary: item.summary,
  platform: item.platform, checkedAt: item.checkedAt, postUrl: item.postUrl,
  officialUrl: item.officialUrl, studyHref: item.studyHref, studyLabel: item.studyLabel,
  stateName: stateByCode(item.state)?.name ?? item.state,
}));

const question = getSampleQuestion();

export default function Page() {
  return (
    <main className="editorial-home">
      <JsonLd data={faqJson(faqs)} />
      <section className="editorial-wrap editorial-hero" aria-labelledby="home-title">
        <div>
          <p className="editorial-kicker"><span />Notary practice by state</p>
          <h1 id="home-title">Know the rule.<br /> <em>Know why.</em></h1>
          <p className="editorial-lead">Practice for your state. Understand each answer. Learn from the questions people actually ask.</p>
          <div>
            <StatePicker indianaPreview={process.env.VERCEL_ENV !== "production" && process.env.STATE_PREVIEW === "1"} />
            <noscript>
              <style>{".editorial-home .home-state-form { display: none; }"}</style>
              <nav className="editorial-static-states" aria-label="State study destinations">
                {statesByName(prepStates).map(state => <a href={stateEntry(state).href} key={state.code}>{state.name}</a>)}
              </nav>
            </noscript>
          </div>
          <a href="#community" className="editorial-hero-link">Explore Community Insights ↗</a>
        </div>
        <HomeSample question={question} />
      </section>
      <ul className="editorial-wrap editorial-values" aria-label="Study features">
        <li>State-specific practice</li>
        <li>Official sources, explained</li>
        <li>Community-informed learning</li>
      </ul>
      <EditorialHomeCommunity insights={featuredInsights} updatedAt={communityInsightsUpdatedAt} />
      <HomeLearning question={question} />
      <EditorialHomePlans />
      <section className="editorial-wrap editorial-section editorial-faq" id="faq" aria-labelledby="faq-heading">
        <div>
          <p className="editorial-kicker">FAQ</p>
          <h2 id="faq-heading">Before you<br />get started.</h2>
          <a href="#contact">Have another question? →</a>
        </div>
        <div className="editorial-faq-list">
          {faqs.map(item => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}{item.href && <> <Link href={item.href}>{item.label}</Link>.</>}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="editorial-wrap" id="contact" aria-labelledby="contact-heading">
        <div className="editorial-contact">
          <div>
            <h2 id="contact-heading">A question? A suggestion?<br />We’re listening.</h2>
            <p>Ask about a plan, report a question, or share an idea for Community Insights.</p>
          </div>
          <Link className="btn btn-primary" href={paths.contact}>Contact Us ↗</Link>
        </div>
      </section>
      <section className="editorial-wrap editorial-final-wrap" aria-labelledby="final-heading">
        <div className="editorial-final editorial-dark">
          <div>
            <h2 id="final-heading">Your next step<br />starts with <em>your state.</em></h2>
            <p>Find your state. Try a free practice session.<br />See what you already know and what to study next.</p>
          </div>
          <a className="btn editorial-yellow-button" href="#state-selection" aria-label="Choose your state">Choose your state <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </main>
  );
}
