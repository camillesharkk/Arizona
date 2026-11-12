import SharedPage from "@/app/preview/[state]/become-a-notary/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "How to Become a New York Notary",
  description: "Follow New York qualification, examination, oath, application and appointment steps.",
  path: "/new-york/become-a-notary/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }) });
}
