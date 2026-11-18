export function HomeTrust() {
  return (
    <section
      className="home-trust home-section"
      id="why-choose-us"
      aria-labelledby="home-trust-heading"
      data-reveal
    >
      <h2 id="home-trust-heading">Why Choose Us</h2>
      <div className="home-trust-grid">
        <article className="home-evidence">
          <h3>Official Sources Behind Every Answer</h3>
          <p>See the official rule behind each answer and the date we last verified it.</p>
        </article>
        <article className="home-evidence">
          <h3>A Study Plan Built Around Your Mistakes</h3>
          <p>Take a practice test, review missed questions, and use Daily Study and flashcards to focus on the topics you need most.</p>
        </article>
        <article className="home-evidence">
          <h3>Study Tips From the Notary Community</h3>
          <p>
            We review public discussions about notary exam prep and use
            recurring questions to guide new flashcards and practice topics.
          </p>
          <a className="home-text-link" href="#community-insights">
            Explore Community Insights <span aria-hidden="true">↓</span>
          </a>
        </article>
      </div>
    </section>
  );
}
