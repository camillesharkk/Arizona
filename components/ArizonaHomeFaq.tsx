import { MemberCopy } from "@/components/MemberCopy";
import { memberActionLabel } from "@/lib/member-copy";
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
              <MemberCopy member={item.question === "Is there a free Arizona notary practice test?" ? "How do I start Arizona notary practice?" : item.question}>{item.question}</MemberCopy>
              <span aria-hidden="true">⌄</span>
            </summary>
            <div>
              <p><MemberCopy member={item.question === "Is there a free Arizona notary practice test?" ? "Start with Quick 10, pick a topic, or take Full 45 with your membership." : item.answer}>{item.answer}</MemberCopy></p>
              <p className="home-faq-links">
                {item.links.map((link) => (
                  <a key={link.href} href={link.href}>
                    <MemberCopy member={memberActionLabel(link.label)}>{link.label}</MemberCopy>
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
