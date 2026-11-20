import { StatePricingPage } from "@/components/StatePricingPage";
import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";

const codes: Record<string, "CT" | "IN" | "NC" | "NY" | "PA" | "LA"> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA", indiana: "IN", "north-carolina": "NC", connecticut: "CT" };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  if (!prepPageEnabled(state)) notFound();
  const code = codes[state];
  if (!code) notFound();
  return <StatePricingPage state={code} preview />;
}
