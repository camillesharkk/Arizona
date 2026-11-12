import SharedPage from "@/app/preview/[state]/laws/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Notary Laws",
  description: "Review New York appointment, notarial acts, identification, journal, fees and electronic notarization rules.",
  path: "/new-york/laws/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }) });
}
