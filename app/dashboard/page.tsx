import { DashboardClient } from "@/components/DashboardClient";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata = pageMeta({
  title: "Dashboard",
  description: "Your Arizona notary study progress, scores, and readiness.",
  path: paths.dashboard,
});

export default function DashboardPage() {
  return (
    <main className="wrap hero">
      <Breadcrumb items={[{ name: "Home", path: paths.home }, { name: "Dashboard", path: paths.dashboard }]} />
      <h1>Dashboard</h1>
      <DashboardClient />
    </main>
  );
}
