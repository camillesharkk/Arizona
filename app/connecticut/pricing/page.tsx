import SharedPage from "@/app/preview/[state]/pricing/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Connecticut Notary Pro Access",
  description: "One purchase covers Connecticut and every available state for 60 days.",
  path: "/connecticut/pricing/",
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "connecticut" }) });
}
