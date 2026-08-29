import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arizona Exam",
    short_name: "AZ Exam",
    description: "Arizona notary exam practice",
    start_url: "/arizona-notary-exam/",
    display: "standalone",
    background_color: "#f6f1ea",
    theme_color: "#c45c26",
  };
}
