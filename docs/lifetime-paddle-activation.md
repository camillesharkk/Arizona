# Lifetime Pro Paddle activation

Lifetime Pro uses a $29.99 USD one-time Paddle catalog price. The order covers $19.99 of lifetime access and the $10 official-exam refund guarantee. The new flow uses the existing Paddle overlay, account session, quotes, checkout bindings and signed webhook endpoint.

## Vercel Production settings

Add the following entries to the existing Arizona project under **Production**.

```dotenv
PADDLE_LIFETIME_PRODUCT_ID=pro_01m7q8c7xbe978746wx7n1t5d9
PADDLE_LIFETIME_PRICE_ID=pri_01m7q8g48pcgkxncf7jbh2hq0q
LIFETIME_REFUND_POLICY_VERSION=2026-11-lifetime-v2
```

Keep `LIFETIME_CHECKOUT_ENABLED` unset on the first production build. Set it to `1` and rebuild only after the migration, webhook aliases, and production catalog and notification evidence have been verified. Disabling this switch leaves signed notifications and existing entitlements available.

The existing Production keys are `MOR_PROVIDER`, `PADDLE_ENVIRONMENT`, `NEXT_PUBLIC_PADDLE_ENV`, `PADDLE_PRODUCT_ID`, `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` and `DATABASE_URL`. Confirm `MOR_PROVIDER=paddle`, `PADDLE_ENVIRONMENT=production` and `NEXT_PUBLIC_PADDLE_ENV=production` in Vercel. Keep the 60-Day product ID and current Live bindings. The server key must allow `price.read` as well as existing transaction permissions. Keep the API key and webhook secret server-only. The Live price should be active, one-time, USD 29.99 and free of price overrides that change the currency or base amount. Paddle determines applicable taxes and payment methods. [Get a price](https://developer.paddle.com/api-reference/prices/get-price/).

For a future protected Preview, use an isolated database and separate Sandbox product/price IDs and credentials, scoped to that Preview. The provided IDs are for Production.

The read-only `scripts/lifetime-production-audit.mjs` prints comparisons and schema metadata. Run only with verified Production values in a trusted process and with `LIFETIME_AUDIT_SOURCE=vercel-production`. Vercel CLI cannot pull variables marked Secret. In that case, obtain results from a trusted process with access to the deployed values or from an authorized operator. When using `vercel env run --environment production`, use an empty directory and clear inherited payment and database variables first. Discard any result that loaded a local dotenv file. Share booleans, the endpoint identifier and migration ledger, plus the destination ID and redacted delivery evidence.

## Database and notification destination

1. Record the current Vercel deployment ID and commit. Match the effective Production database endpoint against its Neon project and branch, then check the ledger and DDL through a read-only session. `npm run db:migrate` applies every unregistered migration. Use it only when 018 is the sole pending migration in the reviewed release, and stop on any unexpected ledger or schema differences.
2. Before migrating, record a timestamp or LSN, create a recoverable snapshot or branch from that production point, and verify that the isolated branch can be opened and contains the expected migration ledger, paid orders and timed entitlements. Save identifying metadata without credentials. Apply 018 inside a transaction that records its ledger entry atomically. Verify nullable `entitlements.expires_at`, the validated `entitlements_lifetime_window_check`, `provider_refunds` with its composite primary key and refund reason, and the 018 ledger entry. Check that existing timed rows still have expiration dates. Lifetime uses `product_code=all_state_pro_lifetime`, `state=ALL`, `expires_at=NULL`.
3. In the Live Paddle notification destination for `/api/billing/webhook/`, keep existing events and ensure these three are selected. Use that destination's existing signing secret.

   - `transaction.completed`
   - `adjustment.created`
   - `adjustment.updated`

   A completed transaction can fulfill a server-bound quote. The adjustment events cover auto-approved and later-approved adjustments. [Completed transactions](https://developer.paddle.com/webhooks/transactions/transaction-completed/) · [Adjustment created](https://developer.paddle.com/webhooks/adjustments/adjustment-created/) · [Adjustment updated](https://developer.paddle.com/webhooks/adjustments/adjustment-updated/).

4. Stage the reviewed commit with new Lifetime sales disabled. Verify that Vercel lists both `arizonanotaryprep.com` and `arizona-lac.vercel.app` on that exact production deployment, and that the existing notification path is served there. Capture notification-setting ID, saved event names and traffic source, signing-secret match or a current authentic event with handler acceptance, and actual Live GET price metadata using the deployed credential. A public GET 405, historic delivery, or a Dashboard key name cannot establish these facts.
5. Enable the sales switch and build Production again. Recheck both aliases and exact commit. With an authorized test account, verify sign-in return and open checkout only when a Live payable test transaction is explicitly authorized. Confirm the displayed USD 29.99 base amount, tax handling and one-time payment. Close the overlay for this smoke check. A checkout opening is not payment acceptance.
6. The account owner may then authorize and complete one actual payment. Match the exact `txn_…` across the Paddle completed transaction, the destination's successful authentic notification, the paid commerce order and its active matching Lifetime entitlement. Verify no expiry and access in at least two launched states, refresh and re-sign-in, and check replay deduplication. If Paddle has a receipt but app access is missing, check the existing transaction and replay its original signed notification from Paddle only after confirming the compatible webhook deployment, with operator authorization. Keep the same order and do not charge again.

## Refunds and recovery

- Support reviews exam evidence using the published policy. Check the transaction's adjustment history before approving an eligible $10 partial refund, which is available once per order. Submit the partial refund against the transaction's line item in Paddle. The app keeps Lifetime access active after partial refunds.
- Approved full refunds, full-line refunds and chargebacks affect only the matching Lifetime order. A terminal refund received before completion is recorded without creating active access. A separate valid timed purchase remains available. Chargeback warnings, reversals and unusual sequences of multiple partial refunds need operator review against the original transaction and paid principal. The $10 exam-guarantee partial keeps access active.
- If the release fails before any Lifetime transaction can be issued, restore the previously identified deployment at the Vercel routing layer and leave the compatible 018 schema in place. Once a Lifetime transaction might exist, disable new sales using `LIFETIME_CHECKOUT_ENABLED` and deploy the reviewed code with sales disabled. Do not return the webhook or customer access routes to a pre-Lifetime release. Keep both Lifetime Paddle IDs, signing secret, schema and webhook enabled so already-created transactions can settle. Retain the live database as the authoritative ledger.
- Use a separate recovery branch for investigation if database recovery is required. Reconcile any writes after the recovery point against the current database and Paddle by transaction ID, preserve order/binding/entitlement/refund records and notifications, and recover missing writes with the original signed notification after restoring compatible code. An in-place restore of an earlier snapshot may erase new payments and refunds.
