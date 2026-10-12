import { SeoGuidePage } from "@/components/SeoGuidePage";
import { seoGuideMetadata } from "@/lib/seo-guides";

export const metadata = seoGuideMetadata("open-book");
export default function Page() { return <SeoGuidePage id="open-book" />; }
