import { SeoGuidePage } from "@/components/SeoGuidePage";
import { seoGuideMetadata } from "@/lib/seo-guides";

export const metadata = seoGuideMetadata("how-hard");
export default function Page() {
  return <SeoGuidePage id="how-hard" />;
}
