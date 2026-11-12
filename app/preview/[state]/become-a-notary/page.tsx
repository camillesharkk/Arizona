import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { StateArticlePage } from "@/components/StateArticle";
import { nyApplication } from "@/data/ny-guides";

export const metadata = { title: nyApplication.title, description: nyApplication.description };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (!prepPageEnabled((await params).state) || (await params).state !== "new-york") notFound();
  return <StateArticlePage article={nyApplication} />;
}
