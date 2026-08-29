import { AuthForm } from "@/components/AuthForm";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({
  title: "Create a free Arizona Exam account",
  description: "Register to sync practice tests, mistakes, and study progress in the cloud.",
  path: paths.register,
});

export default function RegisterPage() {
  return (
    <main className="wrap hero">
      <h1>Create a free account</h1>
      <p className="lede">Optional until you want scores and the notebook saved across devices.</p>
      <AuthForm mode="register" />
    </main>
  );
}
