import { AuthForm } from "@/components/AuthForm";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({
  title: "Sign in",
  description: "Sign in to save Arizona notary practice scores and your wrong-answer notebook.",
  path: paths.login,
});

export default function LoginPage() {
  return (
    <main className="wrap hero">
      <h1>Sign in</h1>
      <p className="notice">For account security, please sign in again.</p>
      <AuthForm mode="login" />
    </main>
  );
}
