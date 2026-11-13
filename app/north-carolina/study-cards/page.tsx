import SharedPage from "@/app/preview/[state]/study-cards/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "North Carolina Notary Study Cards", description: "Pre-class preparation and post-class review for North Carolina traditional notaries.", path: "/north-carolina/study-cards/", index: true });

export default function Page({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  return SharedPage({ params: Promise.resolve({ state: "north-carolina" }), searchParams });
}
