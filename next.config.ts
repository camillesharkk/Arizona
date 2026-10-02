import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  serverExternalPackages: ["postgres", "posthog-node"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.arizonanotaryprep.com" }],
        destination: "https://arizonanotaryprep.com/:path*",
        permanent: true,
      },
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
