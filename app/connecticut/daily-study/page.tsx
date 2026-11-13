import SharedPage from "@/app/preview/[state]/daily-study/page";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "Connecticut Daily Study", description: "Connecticut notary learning and review.", path: "/connecticut/daily-study/", index: false });
export default function Page(props: { searchParams: Promise<{ topic?: string; attempt?: string }> }) {
  return SharedPage({ ...props, params: Promise.resolve({ state: "connecticut" }) });
}
