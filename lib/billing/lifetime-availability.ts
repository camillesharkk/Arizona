import "server-only";
import { cache } from "react";
import { lifetimeCheckoutConfigured } from "@/lib/billing/paddle";
import { getPgSql } from "@/lib/store/pg-store";

export const getLifetimeCheckoutAvailability = cache(async () => {
  if (!lifetimeCheckoutConfigured() || !/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || "")) return false;
  try {
    const sql = getPgSql();
    const [row] = await sql<{ ready: boolean }[]>`
      select to_regclass('provider_refunds') is not null
        and exists (
          select 1 from information_schema.columns
          where table_schema = current_schema() and table_name = 'entitlements'
            and column_name = 'expires_at' and is_nullable = 'YES'
        ) as ready
    `;
    return row?.ready === true;
  } catch {
    return false;
  }
});
