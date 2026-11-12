# Paddle sandbox investigation — November 12, 2026

The current sandbox server credential is rejected before account and permission introspection. Recovery still requires an authenticated Paddle dashboard check. The exact key status and account restrictions remain unknown.

## Requests and configuration

The original local configuration selects sandbox in both PADDLE_ENVIRONMENT and NEXT_PUBLIC_PADDLE_ENV. Its server key has the valid69-character pdl_sdbx_apikey format with no whitespace. The browser token has the sandbox test_ prefix. The SDK selects sandbox-api.paddle.com. The production environment export contains redacted placeholders and was unsuitable for account comparison.

An unauthenticated GET of the sandbox API root succeeded with200. The same endpoint using the configured server key returned403/forbidden, as did the configured product read. Paddle documents the root as a way to identify the caller account and permissions. This failed before either field was available. A specific missing transaction permission, expiry or revocation has not been established. [API root](https://developer.paddle.com/api-reference/api-root/get-api-root/), [authentication](https://developer.paddle.com/api-reference/about/authentication/)

Safe correlation identifiers from the read-only follow-up are recorded below.

- Authenticated root returned403 with request ID dba24d47-43f0-452f-937c-114586432219.
- Product pro_01m1zxaw53b3thw2hg70546km0 returned403 with request ID38b54297-c49d-4648-a111-e224a1aa636a.
- Unauthenticated root returned200 with request ID8e5802d1-ba01-460c-9009-d619c4b6adfe.

Product ownership and active status remain unverified. No catalog price ID is configured. The application uses the existing product and a non-catalog one-time price derived from its server quote. PADDLE_PRICE_ID is unused. The existing standard amount remains USD22.21 and the dedicated new test accounts received USD19.99 newcomer quotes.

The browser token's format and environment were checked. Its account membership, status and the account's checkout-domain/default-payment-link settings require the dashboard. A client-token bearer probe of the server API root returned authentication_malformed and provides no evidence about the token's browser validity.

## Actual checkout API results

Dedicated example.invalid accounts exercised the PA public candidate at localhost3421 and the LA preview at localhost3422. Both pricing HTML pages returned200 and contained the purchase control. Both server quotes returned200 with1999USD cents. Requests supplied sourceState PA and LA respectively.

- PA checkout returned502/PADDLE_CHECKOUT_HTTP. A direct sandbox transaction diagnostic using the same quote amount and source_state PA returned403/forbidden with request ID2c540815-49d6-4516-8880-5303ded1e539.
- LA checkout returned502/PADDLE_CHECKOUT_HTTP. Its matching diagnostic with source_state LA returned403/forbidden with request IDde758734-c88d-4cd6-a798-b508c0b315c9.

No transaction ID was created. Provider storage of the source state and amount remains unverified. Payment, provider callback and a real60-day entitlement grant were not reached. Existing mocked Paddle transaction, callback, reconciliation and commerce regressions passed.

Chrome reached the sandbox Paddle login page. Browser control then stopped because it could not reliably determine the current Windows browser URL. This round therefore has no new purchase-button click or visible checkout result. The preceding browser acceptance remains recorded in the two state acceptance reports.

## Account-owner actions

Open the sandbox dashboard and sign in. Under My account → Settings → Authentication → API keys, identify the integration key and inspect its status, expiry and permissions. The application uses transaction.read and transaction.write. Product and price ownership verification additionally uses product.read and price.read. A valid root response should identify the expected account before individual endpoint permissions are diagnosed. [Sandbox dashboard](https://sandbox-vendors.paddle.com/), [permissions](https://developer.paddle.com/api-reference/about/permissions/)

If the current key is inactive, create its sandbox replacement in that account and enter it directly in D:\webtest\web\.env.local as PADDLE_API_KEY. Keep PADDLE_ENVIRONMENT and NEXT_PUBLIC_PADDLE_ENV set to sandbox. In the same sandbox account, confirm product pro_01m1zxaw53b3thw2hg70546km0 and the existing browser token under Authentication → Client-side tokens. A token replacement belongs in NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and requires rebuilding the preview client.

If an active matching key still fails the root request, provide the safe request IDs above to Paddle support for account-level diagnosis. Paddle recommends supplying the request_id when investigating forbidden errors. [Paddle forbidden troubleshooting](https://developer.paddle.com/errors/shared/forbidden/)

Vercel configuration changes are unnecessary for the current local reproduction. A later protected sandbox Preview needs these same sandbox fields scoped to that Preview and the matching sandbox webhook endpoint secret in PADDLE_WEBHOOK_SECRET. The callback must use a reachable HTTPS URL and be configured in that sandbox account before payment/callback acceptance can complete.

The reusable check prints only selected diagnostic fields and makes read-only sandbox requests.

```powershell
node scripts/paddle-sandbox-preflight.mjs --env-file D:\webtest\web\.env.local
```

After root/product checks succeed, rerun the two actual pricing-button flows, verify the visible checkout total and source-state transaction metadata, then use a Paddle sandbox test payment and verify the signed callback, durable paid order and account-wide60-day entitlement. These steps remain pending.
