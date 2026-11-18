import {
  communityInsights,
  sourceTrustSample,
} from "@/data/community-insights";
import { WrongAnswerPreview } from "@/components/WrongAnswerPreview";

export function HomeTrust() {
  const community = communityInsights[0];
  return (
    <section
      className="home-trust home-section"
      aria-labelledby="home-trust-heading"
      data-reveal
    >
      <p className="home-eyebrow">A CLOSER LOOK AT YOUR PREP</p>
      <h2 id="home-trust-heading">Why Trust Our Prep?</h2>
      <div className="home-trust-grid">
        <article className="home-evidence">
          <p className="home-card-label">OFFICIAL SOURCES</p>
          <h3>A rule you can check</h3>
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
          <p className="home-card-label">YOUR NEXT STUDY SESSION</p>
          <h3>Review what you missed</h3>
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
          <p>Find a missed question and choose what to study next.</p>
          <a className="home-text-link" href="/wrong-answers/">
            Open Wrong Answers <span aria-hidden="true">→</span>
          </a>
        </article>
        <article className="home-evidence">
          <p className="home-card-label">COMMUNITY-INFORMED STUDY</p>
          <h3>Turn a question into a study habit</h3>
          <p>
            Arizona candidates discuss finding rules under time pressure.
            Rehearse a manual lookup with our study card.
          </p>
          <p className="home-evidence-meta">
            <a
              href={community.postUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the public discussion ↗
            </a>
            <br />
            Last reviewed{" "}
            <time dateTime={community.checkedAt}>{community.checkedAt}</time>
          </p>
          <a className="home-text-link" href={community.studyHref}>
            Study manual navigation <span aria-hidden="true">→</span>
          </a>
        </article>
      </div>
    </section>
  );
}
