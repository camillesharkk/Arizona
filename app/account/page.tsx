import { AccountSettings } from "@/components/AccountSettings";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({ title: "Account Settings", description: "Profile, password, and email reminders.", path: paths.account });

export default function AccountPage() {
  return (
    <main className="wrap hero">
      <h1>Account Settings</h1>
      <p className="lede">Manage your profile, study reminders, exam date, and password.</p>
      <AccountSettings />
    </main>
  );
}
