import SharedPage from "@/app/preview/[state]/wrong-answers/page";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "Connecticut Wrong Answers", description: "Connecticut notary learning and review.", path: "/connecticut/wrong-answers/", index: false });
export default function Page(props: { searchParams: Promise<{ topic?: string; attempt?: string }> }) {
  return SharedPage({ ...props, params: Promise.resolve({ state: "connecticut" }) });
}
