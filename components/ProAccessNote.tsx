import Link from "next/link";
import { paths } from "@/lib/paths";

export function formatProUntil(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function daysUntil(iso: string) {
  return (new Date(iso).getTime() - Date.now()) / 86400000;
}

export function ProAccessNote({
  plan,
  planExpiresAt,
  compact = false,
  purchaseEnabled = true,
}: {
  plan?: string | null;
  planExpiresAt?: string | null;
  compact?: boolean;
  purchaseEnabled?: boolean;
}) {
  if (plan !== "pro" || !planExpiresAt) return null;
  const label = formatProUntil(planExpiresAt);
  const days = daysUntil(planExpiresAt);
  if (compact) {
    return (
      <span>
        Pro · Active until {label}
        {purchaseEnabled && days > 0 && days <= 14 ? (
          <>
            {" "}
            ·{" "}
            <Link href={paths.pricing}>Need more time? Add another 60 days.</Link>
          </>
        ) : null}
      </span>
    );
  }
  return (
    <div>
      <p>
        <strong>Pro Access</strong> · Active until {label}
      </p>
      {purchaseEnabled && days > 0 && days <= 14 ? (
        <p className="notice">
          Need more time?{" "}
          <Link href={paths.pricing}>Add another 60 days.</Link>
        </p>
      ) : null}
    </div>
  );
}
