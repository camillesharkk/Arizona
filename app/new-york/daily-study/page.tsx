import SharedPage from "@/app/preview/[state]/daily-study/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Daily Study",
  description: "Your New York study plan, review schedule and practice history.",
  path: "/new-york/daily-study/",
  index: false,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }) });
}
