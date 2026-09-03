import { redirect } from "next/navigation";
import { DeleteAccountClient } from "@/components/DeleteAccountClient";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata = pageMeta({
  title: "Delete account",
  description: "Permanently delete your Arizona Exam account.",
  path: paths.accountDelete,
});

export default async function DeleteAccountPage() {
  const session = await getSession();
  if (!session) redirect(paths.login);
  const store = await getStore();
  const user = await store.getUserById(session.id);
  if (!user || user.deletedAt) redirect(paths.login);
  const entitlement = await store.getArizonaEntitlement(session.id);
  return (
    <main className="wrap hero">
      <h1>Delete account</h1>
      <DeleteAccountClient
        email={user.email}
        arizonaPro={Boolean(entitlement)}
        planExpiresAt={entitlement?.expiresAt ?? null}
      />
    </main>
  );
}
