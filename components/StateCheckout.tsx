import { CheckoutButton } from "@/components/CheckoutButton";
import { PRO_PRODUCTS, paddleProductIdFor, type ProState } from "@/lib/pro-products";
import { formatUsd } from "@/lib/pricing/money";
import { STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";

export function StateCheckout({ state }: { state: Exclude<ProState, "AZ"> }) {
  const product = PRO_PRODUCTS[state];
  const ready = Boolean(paddleProductIdFor(state));
  return (
    <div className="card">
      <h2>{product.label} Pro · {formatUsd(STANDARD_PRICE_CENTS)} · 60 days</h2>
      <p>Same purchase rules as Arizona: newcomer and referral discounts apply at checkout, access lasts 60 days, and buying again before it ends starts after the current expiry. A purchase for one state does not unlock another.</p>
      {ready ? (
        <CheckoutButton productCode={product.code} />
      ) : (
        <p>
          The price above is the live catalog price. Checkout cannot open until {product.paddleEnv} is set to the Paddle product id for {product.label}. No charge is created from this page without that product.
        </p>
      )}
    </div>
  );
}
