import SharedPage from "@/app/preview/[state]/daily-study/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Louisiana Daily Study",
  description: "Your Louisiana study plan, review schedule and practice history.",
  path: "/louisiana/daily-study/",
  index: false,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "louisiana" }) });
}
