import { NcApplicationGuide } from "@/components/NcApplicationGuide";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "North Carolina Course examination requirements", description: "Initial traditional notary course and application requirements.", path: "/north-carolina/passing-score/", index: false });
export default function Page() {
  return (
    <main className="wrap hero">
      <h1>Course examination requirements</h1>
      <NcApplicationGuide />
    </main>
  );
}
