import { SeoGuidePage } from "@/components/SeoGuidePage";
import { seoGuideMetadata } from "@/lib/seo-guides";

export const metadata = seoGuideMetadata("question-count");
export default function Page() {
  return <SeoGuidePage id="question-count" />;
}
