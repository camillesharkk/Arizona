import Link from "next/link";
import { sourceTrustSample } from "@/data/community-insights";
import { WrongAnswerPreview } from "@/components/WrongAnswerPreview";
import { paths } from "@/lib/paths";

export function HomeTrust() {
  return (
    <section
      className="home-trust home-section"
      aria-labelledby="home-trust-heading"
      data-reveal
    >
      <p className="home-eyebrow">A CLOSER LOOK AT YOUR PREP</p>
      <h2 id="home-trust-heading">Why Choose Us</h2>
      <div className="home-trust-grid">
        <article className="home-evidence">
          <h3>Official Sources Behind Every Answer</h3>
          <p>See the official rule behind each answer and the date we last verified it.</p>
          <div className="home-sample-question">
            <p>{sourceTrustSample.question}</p>
            <strong>{sourceTrustSample.answer}</strong>
          </div>
          <p className="home-evidence-meta">
            Official source{" "}
            <a
              href={sourceTrustSample.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {sourceTrustSample.reference}
            </a>
            <br />
            Last verified{" "}
            <time dateTime={sourceTrustSample.lastVerifiedAt}>
              {sourceTrustSample.lastVerifiedAt}
            </time>
          </p>
          <a className="home-text-link" href={sourceTrustSample.practiceHref}>
            Try Arizona practice <span aria-hidden="true">→</span>
          </a>
        </article>
        <article className="home-evidence home-evidence-product">
          <h3>A Study Plan Built Around Your Mistakes</h3>
          <figure className="home-product-window">
            <div className="home-product-titlebar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>Wrong Answers</span>
            </div>
            <WrongAnswerPreview question={sourceTrustSample.question} />
            <figcaption>Interface demo · Sample study content</figcaption>
          </figure>
          <p>Take a practice test, review missed questions, and use Daily Study and flashcards to focus on the topics you need most.</p>
          <a className="home-text-link" href="/wrong-answers/">
            Open Wrong Answers <span aria-hidden="true">→</span>
          </a>
        </article>
        <article className="home-evidence">
          <h3>Study Tips From the Notary Community</h3>
          <p>
            We review public discussions about notary exam prep and use
            recurring questions to guide new flashcards and practice topics.
          </p>
          <Link className="home-text-link" href={paths.community}>
            Browse Community Insights <span aria-hidden="true">→</span>
          </Link>
        </article>
      </div>
    </section>
  );
}
