import { arizonaHomeFaq } from "@/data/arizona-home-faq";
import { paths } from "@/lib/paths";

export function ArizonaHomeFaq() {
  return (
    <section
      className="home-section home-faq"
      aria-labelledby="arizona-faq-heading"
    >
      <p className="home-eyebrow">QUESTIONS, ANSWERED</p>
      <h2 id="arizona-faq-heading">
        Arizona Notary Exam &amp; Commission FAQs
      </h2>
      <div className="home-faq-list">
        {arizonaHomeFaq.map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <span aria-hidden="true">⌄</span>
            </summary>
            <div>
              <p>{item.answer}</p>
              <p className="home-faq-links">
                {item.links.map((link) => (
                  <a key={link.href} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </p>
            </div>
          </details>
        ))}
      </div>
      <div className="home-contact">
        <p>Still have questions?</p>
        <a className="home-contact-button" href={paths.contact}>
          Contact Us
        </a>
      </div>
    </section>
  );
}
