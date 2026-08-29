import { AuthForm } from "@/components/AuthForm";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({ title: "Reset password", description: "Choose a new password.", path: paths.reset });

export default function ResetPage() {
  return (
    <main className="wrap hero">
      <h1>Reset password</h1>
      <AuthForm mode="reset" />
    </main>
  );
}
