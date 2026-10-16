import { SeoGuidePage } from "@/components/SeoGuidePage";
import { seoGuideMetadata } from "@/lib/seo-guides";

export const metadata = seoGuideMetadata("three-day");
export default function Page() { return <SeoGuidePage id="three-day" />; }
