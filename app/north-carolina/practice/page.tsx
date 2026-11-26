import SharedPage from "@/app/preview/[state]/practice/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "North Carolina Notary Practice Questions | Free Quick 10", description: "Try a free Quick 10, review North Carolina notary rules with explanations, and practice before or after your approved traditional-notary class.", path: "/north-carolina/practice/", index: true });

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "north-carolina" }) });
}
