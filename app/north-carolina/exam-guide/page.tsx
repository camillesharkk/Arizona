import { NcApplicationGuide } from "@/components/NcApplicationGuide";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "North Carolina Course and application guide", description: "Initial traditional notary course and application requirements.", path: "/north-carolina/exam-guide/", index: false });
export default function Page() {
  return (
    <main className="wrap hero">
      <h1>Course and application guide</h1>
      <NcApplicationGuide />
    </main>
  );
}
