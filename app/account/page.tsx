import { AccountSettings } from "@/components/AccountSettings";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({ title: "Account", description: "Profile, password, and email reminders.", path: paths.account });

export default function AccountPage() {
  return (
    <main className="wrap hero">
      <h1>Account</h1>
      <AccountSettings />
    </main>
  );
}
