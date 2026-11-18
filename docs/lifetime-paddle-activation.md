# Lifetime Pro Paddle activation

Lifetime Pro uses a $29.99 USD one-time Paddle catalog price. The order covers $19.99 of lifetime access and the $10 official-exam refund guarantee. The new flow uses the existing Paddle overlay, account session, quotes, checkout bindings and signed webhook endpoint.

## Vercel Production settings

Add the following entries to the existing Arizona project under **Production**.

```dotenv
PADDLE_LIFETIME_PRODUCT_ID=pro_01m7q8c7xbe978746wx7n1t5d9
PADDLE_LIFETIME_PRICE_ID=pri_01m7q8g48pcgkxncf7jbh2hq0q
LIFETIME_REFUND_POLICY_VERSION=2026-11-lifetime-v2
```

The existing Production keys are `MOR_PROVIDER`, `PADDLE_ENVIRONMENT`, `NEXT_PUBLIC_PADDLE_ENV`, `PADDLE_PRODUCT_ID`, `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` and `DATABASE_URL`. Confirm `MOR_PROVIDER=paddle`, `PADDLE_ENVIRONMENT=production` and `NEXT_PUBLIC_PADDLE_ENV=production` in Vercel. Keep the 60-Day product ID and current Live bindings. The server key must allow `price.read` as well as existing transaction permissions. Keep the API key and webhook secret server-only. The Live price should be active, one-time, USD 29.99 and free of price overrides that change the currency or base amount. Paddle determines applicable taxes and payment methods. [Get a price](https://developer.paddle.com/api-reference/prices/get-price/).

For a future protected Preview, use an isolated database and separate Sandbox product/price IDs and credentials, scoped to that Preview. The provided IDs are for Production.

## Database and notification destination

1. Check the production database binding and the migration ledger before applying SQL. Apply only `db/migrations/018_lifetime_entitlements.sql` if it is the only pending change in this release. The project recorded later community migration 019 separately. Exit if another pending migration needs unrelated review.
2. Verify `entitlements.expires_at` is nullable, the Lifetime shape constraint exists, `provider_refunds` exists and migration 018 is recorded. Existing timed products still require an expiry. Lifetime uses `product_code=all_state_pro_lifetime`, `state=ALL`, `expires_at=NULL`.
3. In the Live Paddle notification destination for `/api/billing/webhook/`, keep existing events and ensure these three are selected. Use that destination's existing signing secret.

   - `transaction.completed`
   - `adjustment.created`
   - `adjustment.updated`

   A completed transaction can fulfill a server-bound quote. The adjustment events cover auto-approved and later-approved adjustments. [Completed transactions](https://developer.paddle.com/webhooks/transactions/transaction-completed/) · [Adjustment created](https://developer.paddle.com/webhooks/adjustments/adjustment-created/) · [Adjustment updated](https://developer.paddle.com/webhooks/adjustments/adjustment-updated/).

4. After those checks, deploy the validated code and verify the Lifetime purchase cards, sign-in return, and pending confirmation in the target environment. Use Sandbox for a card transaction before authorizing a real payment.

## Refunds and recovery

- Support reviews exam evidence using the published policy. Check the transaction's adjustment history before approving an eligible $10 partial refund, which is available once per order. Submit the partial refund against the transaction's line item in Paddle. The app keeps Lifetime access active after partial refunds.
- An approved full refund or chargeback marks that order refunded and revokes only the matching Lifetime entitlement. A separate valid 60-day purchase remains available. Chargeback warnings and reversals go to manual review. The app preserves the existing 60-day provider behavior.
- After launch, if new sales must be paused, unset `LIFETIME_REFUND_POLICY_VERSION` and redeploy. Keep both Lifetime Paddle IDs, the migration and webhook processing for outstanding orders and existing Lifetime customers.
