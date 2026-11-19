import { Suspense } from "react";
import { StudySettings } from "@/components/StudySettings";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({
  title: "Study Settings",
  description: "Set your study days, target date and daily goals.",
  path: paths.studySettings,
  index: false,
});

export default function StudySettingsPage() {
  return (
    <main className="wrap hero">
      <h1>Study Settings</h1>
      <p className="lede">Choose your target date, study days and daily goals.</p>
      <Suspense fallback={<p>Loading study settings…</p>}>
        <StudySettings />
      </Suspense>
    </main>
  );
}
