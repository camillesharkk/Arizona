import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arizona Exam",
    short_name: "AZ Exam",
    description: "Arizona notary exam practice",
    start_url: "/arizona-notary-exam/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#56758a",
    icons: [
      { src: "/images/brand/notary-study-emblem-192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/brand/notary-study-emblem-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
