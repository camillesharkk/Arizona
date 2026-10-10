import { SeoGuidePage } from "@/components/SeoGuidePage";
import { seoGuideMetadata } from "@/lib/seo-guides";

export const metadata = seoGuideMetadata("passing-score");
export default function Page() {
  return <SeoGuidePage id="passing-score" />;
}
