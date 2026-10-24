import Link from "next/link";
import { hasArizonaPro } from "@/lib/entitlements";
import { paths } from "@/lib/paths";
import { getSession } from "@/lib/session";

export async function ProNudge({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const pro = Boolean(session && (await hasArizonaPro(session.id)));
  if (pro) return <p className="notice">Pro is active for Arizona exam prep.</p>;
  return (
    <p className="notice">
      {children} <Link href={paths.pricing}>View Pro</Link>
    </p>
  );
}
