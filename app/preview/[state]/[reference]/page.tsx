import { notFound } from "next/navigation";
import { StateArticlePage } from "@/components/StateArticle";
import { prepReferences } from "@/lib/prep-articles";
import { prepPageEnabled } from "@/lib/state-release";
import type { PrepCode } from "@/lib/prep-pack";

const codes: Record<string, PrepCode> = { pennsylvania: "PA", louisiana: "LA" };
export default async function Page({ params }: { params: Promise<{ state: string; reference: string }> }) {
  const { state, reference } = await params;
  if (!prepPageEnabled(state)) notFound();
  const article = prepReferences[codes[state]]?.[reference];
  if (!article) notFound();
  return <StateArticlePage article={article} />;
}
