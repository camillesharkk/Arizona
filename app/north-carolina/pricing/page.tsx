import SharedPage from "@/app/preview/[state]/pricing/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "North Carolina Notary Pro Access",
  description: "One purchase covers North Carolina and every available state for 60 days.",
  path: "/north-carolina/pricing/",
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "north-carolina" }) });
}
