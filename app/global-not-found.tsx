import NotFound from "./not-found";
import "./globals.css";
import "./editorial-theme.css";

export const metadata = { title: "Page not found · Notary Exam Prep", robots: { index: false, follow: true } };

export default function GlobalNotFound() {
  return <html lang="en-US"><body><NotFound /></body></html>;
}
