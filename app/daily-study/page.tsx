import { redirect } from "next/navigation";
import { DailyStudyClient } from "@/components/DailyStudyClient";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { getSession } from "@/lib/session";

export const metadata = pageMeta({
  title: "Daily Study",
  description: "Today’s Arizona notary cards and questions, plus the reviews that are due.",
  path: paths.daily,
});

export default async function DailyStudyPage() {
  const session = await getSession();
  if (!session) redirect(`${paths.login}?next=${encodeURIComponent(paths.daily)}`);
  return (
    <main className="wrap hero">
      <h1>Daily Study</h1>
      <DailyStudyClient />
    </main>
  );
}
