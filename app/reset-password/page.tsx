import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata = pageMeta({ title: "Reset password", description: "Choose a new password.", path: paths.reset });

export default function ResetPage() {
  return (
    <main className="wrap hero">
      <h1>Reset password</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
