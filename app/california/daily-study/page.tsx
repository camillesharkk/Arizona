import { redirect } from "next/navigation";
import { DailyStudyClient } from "@/components/DailyStudyClient";
import { caPaths } from "@/lib/ca-site";
import { paths } from "@/lib/paths";
import { siteUrl } from "@/lib/site";
import { getSession } from "@/lib/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "California Daily Study" },
  description: "Today’s California notary cards and questions, plus the reviews that are due.",
  alternates: { canonical: `${siteUrl()}/california/daily-study/` },
  robots: { index: false, follow: false },
};

export default async function Page() {
  const session = await getSession();
  if (!session) redirect(`${paths.login}?next=${encodeURIComponent(caPaths.daily)}`);
  return (
    <main className="wrap hero">
      <h1>Daily Study</h1>
      <DailyStudyClient stateCode="CA" />
    </main>
  );
}
