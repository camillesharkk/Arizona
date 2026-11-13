import SharedPage from "@/app/preview/[state]/practice/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "North Carolina Notary Practice", description: "Pre-class preparation and post-class review for North Carolina traditional notaries.", path: "/north-carolina/practice/", index: false });

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "north-carolina" }) });
}
