import { notFound } from "next/navigation";
import { StateArticlePage } from "@/components/StateArticle";
import { nyPassingScore } from "@/data/ny-guides";

export const metadata = { title: nyPassingScore.title, description: nyPassingScore.description };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (process.env.STATE_PREVIEW !== "1" || (await params).state !== "new-york") notFound();
  return <StateArticlePage article={nyPassingScore} />;
}
