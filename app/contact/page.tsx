import { ContactForm } from "@/components/ContactForm";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

const meta = pageMeta({
  title: "Contact Arizona Notary Prep",
  description: "Send a message about practice tests, your account, or the study platform.",
  path: paths.contact,
});

export const metadata = { ...meta, robots: { index: false, follow: true } };

export default async function Page({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const examRefund = (await searchParams).topic === "lifetime-exam-refund";
  return (
    <main className="wrap hero">
      <p className="kicker">Support</p>
      <h1>Contact Arizona Notary Prep</h1>
      {examRefund && <section className="card"><h2>Lifetime Pro exam refund request</h2><p>Apply within 30 days of official results for an exam taken after purchase. Include your order number, exam date, result date and official failure proof. You can include a link to the proof in your message or request a reply with evidence-submission instructions.</p><p>Complete requests are reviewed within 5–7 business days. Paddle and your bank determine settlement timing.</p></section>}
      <ContactForm examRefund={examRefund} />
    </main>
  );
}
