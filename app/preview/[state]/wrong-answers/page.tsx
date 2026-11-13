import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { CloudMistakes } from "@/components/CloudMistakes";
import type { PrepCode } from "@/lib/prep-pack";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA", connecticut: "CT" };

export default async function Page({ params, searchParams }: { params: Promise<{ state: string }>; searchParams: Promise<{ topic?: string; attempt?: string }> }) {
  if (!prepPageEnabled((await params).state)) notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  const { topic, attempt } = await searchParams;
  return <CloudMistakes stateCode={code} initialTopic={topic} attemptId={attempt || ""} />;
}
