import { SeoGuidePage } from "@/components/SeoGuidePage";
import { seoGuideMetadata } from "@/lib/seo-guides";

export const metadata = seoGuideMetadata("bond");
export default function Page() {
  return <SeoGuidePage id="bond" />;
}
