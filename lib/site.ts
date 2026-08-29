export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export const site = {
  name: "Arizona Exam",
  legalName: "Arizona Notary Exam Practice",
  tagline: "Free Arizona notary practice test and study platform",
  independent:
    "This website is an independent exam preparation resource and is not affiliated with, endorsed by, or operated by the Arizona Secretary of State.",
};
