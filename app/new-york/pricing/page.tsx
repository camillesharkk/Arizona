import SharedPage from "@/app/preview/[state]/pricing/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Notary Pro Access",
  description: "Unlock New York and every available state with the same 60-day account Pro purchase.",
  path: "/new-york/pricing/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }) });
}
