import { NcApplicationGuide } from "@/components/NcApplicationGuide";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "North Carolina First Notary Application", description: "Eligibility, approved course, written examination, application and county oath steps for first-time North Carolina traditional notaries.", path: "/north-carolina/become-a-notary/", index: true });
export default function Page() {
  return (
    <main className="wrap hero">
      <h1>North Carolina first-application guide</h1>
      <NcApplicationGuide />
    </main>
  );
}
