import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolate acceptance builds from a concurrently running development server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  experimental: { globalNotFound: true },
  trailingSlash: true,
  // Keep metadata in the managed head across client-side state navigation.
  htmlLimitedBots: /.*/,
  serverExternalPackages: ["postgres", "posthog-node"],
  productionBrowserSourceMaps: false,
  async headers() {
    const reportOnly = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://cdn.paddle.com https://sandbox-cdn.paddle.com",
      "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://cdn.paddle.com https://sandbox-cdn.paddle.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://www.clarity.ms https://c.clarity.ms https://*.clarity.ms",
      "font-src 'self' data:",
      "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.google.com https://us.i.posthog.com https://us-assets.i.posthog.com https://www.clarity.ms https://*.clarity.ms https://cdn.paddle.com https://sandbox-cdn.paddle.com https://buy.paddle.com https://sandbox-buy.paddle.com",
      "frame-src 'self' https://www.googletagmanager.com https://buy.paddle.com https://sandbox-buy.paddle.com",
      "report-uri /api/security/csp-report/",
      "report-to csp",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Content-Security-Policy-Report-Only", value: reportOnly },
          { key: "Reporting-Endpoints", value: 'csp="/api/security/csp-report/"' },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.arizonanotaryprep.com" }],
        destination: "https://arizonanotaryprep.com/:path*",
        permanent: true,
      },
      { source: "/arizona-notary-courses/", destination: "/courses/", permanent: true },
      { source: "/arizona-notary-training/", destination: "/courses/", permanent: true },
      { source: "/arizona-notary-exam-practice-test", destination: "/arizona-notary-practice-test/", permanent: true },
      { source: "/arizona-notary-exam-practice-test/", destination: "/arizona-notary-practice-test/", permanent: true },
      { source: "/arizona-notary-exam-questions-and-answers", destination: "/arizona-notary-exam-questions/", permanent: true },
      { source: "/arizona-notary-exam-questions-and-answers/", destination: "/arizona-notary-exam-questions/", permanent: true },
      { source: "/arizona/practice-test", destination: "/arizona-notary-practice-test/", permanent: true },
      { source: "/arizona/practice-test/", destination: "/arizona-notary-practice-test/", permanent: true },
      { source: "/arizona/exam-questions", destination: "/arizona-notary-exam-questions/", permanent: true },
      { source: "/arizona/exam-questions/", destination: "/arizona-notary-exam-questions/", permanent: true },
      { source: "/arizona/study-guide", destination: "/arizona-notary-study-guide/", permanent: true },
      { source: "/arizona/study-guide/", destination: "/arizona-notary-study-guide/", permanent: true },
      { source: "/arizona/exam-guide", destination: "/arizona-notary-exam-prep/", permanent: true },
      { source: "/arizona/exam-guide/", destination: "/arizona-notary-exam-prep/", permanent: true },
      { source: "/arizona/wrong-answers", destination: "/wrong-answers/", permanent: true },
      { source: "/arizona/wrong-answers/", destination: "/wrong-answers/", permanent: true },
      { source: "/arizona/account", destination: "/account/", permanent: true },
      { source: "/arizona/account/", destination: "/account/", permanent: true },
      { source: "/legal/contact", destination: "/contact/", permanent: true },
      { source: "/legal/contact/", destination: "/contact/", permanent: true },
    ];
  },
};

export default nextConfig;
