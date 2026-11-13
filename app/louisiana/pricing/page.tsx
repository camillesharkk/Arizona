import SharedPage from "@/app/preview/[state]/pricing/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Louisiana Notary Pro Access",
  description: "Unlock Louisiana and every available state with the same 60-day account Pro purchase.",
  path: "/louisiana/pricing/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "louisiana" }) });
}
