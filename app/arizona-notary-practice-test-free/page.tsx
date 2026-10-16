import { SeoGuidePage } from "@/components/SeoGuidePage";
import { seoGuideMetadata } from "@/lib/seo-guides";

export const metadata = seoGuideMetadata("free-practice");
export default function Page() { return <SeoGuidePage id="free-practice" />; }
