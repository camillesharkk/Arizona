import { ContactForm } from "@/components/ContactForm";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

const meta = pageMeta({
  title: "Contact Arizona Notary Prep",
  description: "Send a message about practice tests, your account, or the study platform.",
  path: paths.contact,
});

export const metadata = { ...meta, robots: { index: false, follow: true } };

export default function Page() {
  return (
    <main className="wrap hero">
      <p className="kicker">Support</p>
      <h1>Contact Arizona Notary Prep</h1>
      <p className="lede">
        Have a question about the practice tests, your account, or the study platform? Send us a message.
      </p>
      <p>
        <a href="#contact-form">Contact Support</a>
      </p>
      <h2>Contact Support</h2>
      <ContactForm />
    </main>
  );
}
