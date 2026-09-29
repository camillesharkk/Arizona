import { SeoGuidePage } from "@/components/SeoGuidePage";
import { seoGuideMetadata } from "@/lib/seo-guides";

export const metadata = seoGuideMetadata("exam-requirements");
export default function Page() {
  return <SeoGuidePage id="exam-requirements" />;
}
