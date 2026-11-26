import { IndianaGuide } from "@/components/IndianaGuide";
import { pageMeta } from "@/lib/seo";
export const metadata = { ...pageMeta({ title: "How to Become a Notary in Indiana | Application, Course & Exam", description: "Follow Indiana’s first-time notary application steps, from Applicant Hub and required documents to the state course, exam and active commission.", path: "/indiana/become-a-notary/", index: true }), robots: { index: true, follow: true } };
export default function Page() { return <IndianaGuide resources={false} />; }
