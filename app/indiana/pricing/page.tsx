import SharedPage from "@/app/preview/[state]/pricing/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Indiana Notary Pro Access",
  description: "One purchase covers Indiana and every available state for 60 days.",
  path: "/indiana/pricing/",
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "indiana" }) });
}
