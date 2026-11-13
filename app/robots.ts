import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/", "/account/", "/admin/", "/indiana/", "/preview/"] },
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
