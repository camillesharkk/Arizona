import SharedPage from "@/app/preview/[state]/questions/page";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "Connecticut Practice Questions", description: "Connecticut notary learning and review.", path: "/connecticut/questions/", index: false });
export default function Page(props: { searchParams: Promise<{ topic?: string; attempt?: string }> }) {
  return SharedPage({ ...props, params: Promise.resolve({ state: "connecticut" }) });
}
