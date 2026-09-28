export function siteUrl() {
  const explicit = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_ENV === "production") return "https://arizonanotaryprep.com";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  return "http://localhost:3000";
}

export const site = {
  name: "Arizona Exam",
  legalName: "Arizona Notary Exam Practice",
  tagline: "Free Arizona notary practice test and study platform",
  independent:
    "This website is an independent exam preparation resource and is not affiliated with, endorsed by, or operated by the Arizona Secretary of State.",
};
