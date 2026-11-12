import { prepPageEnabled } from "@/lib/state-release";
import { notFound, redirect } from "next/navigation";
import { DailyStudyClient } from "@/components/DailyStudyClient";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";
import { getSession } from "@/lib/session";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA" };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (!prepPageEnabled((await params).state)) notFound();
  const slug = (await params).state;
  const code = codes[slug];
  if (!code) notFound();
  const session = await getSession();
  if (!session) redirect(`/login/?next=${encodeURIComponent(prepPacks[code].paths.daily)}`);
  return (
    <main className="wrap hero">
      <h1>Daily Study</h1>
      <DailyStudyClient stateCode={code} />
    </main>
  );
}
