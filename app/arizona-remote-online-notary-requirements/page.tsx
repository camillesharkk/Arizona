import { SeoGuidePage } from "@/components/SeoGuidePage";
import { seoGuideMetadata } from "@/lib/seo-guides";

export const metadata = seoGuideMetadata("ron");
export default function Page() {
  return <SeoGuidePage id="ron" />;
}
