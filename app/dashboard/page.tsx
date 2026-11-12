import { cookies } from "next/headers";
import { DashboardClient } from "@/components/DashboardClient";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { caPaths } from "@/lib/ca-site";
import { packFor } from "@/lib/prep-pack";
import { hiPaths } from "@/lib/hi-site";
import { Breadcrumb } from "@/components/Breadcrumb";
import { STATE_COOKIE, parseStateCookie, resolveState } from "@/lib/site-state";

export const metadata = pageMeta({
  title: "Dashboard",
  description: "Your Arizona notary study progress, scores, and readiness.",
  path: paths.dashboard,
});

export default async function DashboardPage() {
  const saved = parseStateCookie((await cookies()).get(STATE_COOKIE)?.value);
  const state = resolveState(paths.dashboard, saved);
  const home = packFor(state)?.paths.home || (state === "HI" ? hiPaths.home : state === "CA" ? caPaths.home : paths.home);
  return (
    <main className="wrap hero">
      <Breadcrumb items={[{ name: "Home", path: home }, { name: "Dashboard", path: paths.dashboard }]} />
      <h1>Dashboard</h1>
      <DashboardClient />
    </main>
  );
}
