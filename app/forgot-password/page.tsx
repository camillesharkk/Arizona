import { AuthForm } from "@/components/AuthForm";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({ title: "Forgot password", description: "Reset your Arizona Exam password.", path: paths.forgot });

export default function ForgotPage() {
  return (
    <main className="wrap hero">
      <h1>Forgot password</h1>
      <AuthForm mode="forgot" />
    </main>
  );
}
