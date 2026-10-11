import { redirect } from "next/navigation";
import { paths, redirectWithSearch } from "@/lib/paths";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(redirectWithSearch(paths.home, await searchParams));
}
