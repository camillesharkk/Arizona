import { redirect } from "next/navigation";
import { DailyStudyClient } from "@/components/DailyStudyClient";
import { hiPaths } from "@/lib/hi-site";
import { paths } from "@/lib/paths";
import { canonicalUrl } from "@/lib/site";
import { getSession } from "@/lib/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Hawaii Daily Study" },
  description: "Today’s Hawaii notary cards and questions, plus the reviews that are due.",
  alternates: { canonical: canonicalUrl("/hawaii/daily-study/") },
  robots: { index: false, follow: false },
};

export default async function Page() {
  const session = await getSession();
  if (!session) redirect(`${paths.login}?next=${encodeURIComponent(hiPaths.daily)}`);
  return (
    <main className="wrap hero">
      <h1>Daily Study</h1>
      <DailyStudyClient stateCode="HI" />
    </main>
  );
}
