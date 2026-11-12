import SharedPage from "@/app/preview/[state]/daily-study/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pennsylvania Daily Study",
  description: "Your Pennsylvania study plan, review schedule and practice history.",
  path: "/pennsylvania/daily-study/",
  index: false,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "pennsylvania" }) });
}
