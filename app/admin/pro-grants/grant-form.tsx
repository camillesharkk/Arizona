"use client";

import { useActionState, useId, useState } from "react";
import { submitProGrant } from "./actions";

type Product = { code: string; label: string };

type Props = {
  requestId: string;
  products: readonly Product[];
  defaultDays: number;
  maxDays: number;
  maxReason: number;
};

export function GrantForm(props: Props) {
  const [requestId, setRequestId] = useState(props.requestId);
  return <GrantFields key={requestId} {...props} requestId={requestId}
    onNewGrant={() => setRequestId(crypto.randomUUID())} />;
}

function GrantFields({ requestId, products, defaultDays, maxDays, maxReason, onNewGrant }: Props & { onNewGrant: () => void }) {
  const [result, action, pending] = useActionState(submitProGrant, null);
  const [email, setEmail] = useState("");
  const [productCode, setProductCode] = useState(products[0]?.code ?? "");
  const [days, setDays] = useState(String(defaultDays));
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const titleId = useId();
  const inactive = pending || result?.ok;

  return (
    <form action={action} aria-labelledby={titleId}>
      <input name="requestId" type="hidden" value={requestId} />
      <fieldset disabled={inactive} style={{ minInlineSize: 0, border: 0, margin: 0, padding: 0, width: "100%" }}>
        <legend id={titleId}>手动授权</legend>
        <label className="field">
          账号邮箱（必填）
          <input type="email" name="email" value={email} onChange={event => { setEmail(event.target.value); setConfirmed(false); }}
            required maxLength={254} autoComplete="off" autoCapitalize="none" spellCheck={false} />
        </label>
        <label className="field">
          限时 Pro 产品
          <select name="productCode" value={productCode}
            onChange={event => { setProductCode(event.target.value); setConfirmed(false); }} required>
            {products.map(product => <option key={product.code} value={product.code}>{product.label}</option>)}
          </select>
        </label>
        <label className="field">
          授权天数（1–{maxDays} 天）
          <input type="number" name="days" min={1} max={maxDays} step={1} value={days}
            onChange={event => { setDays(event.target.value); setConfirmed(false); }} required />
        </label>
        <label className="field">
          授权原因（必填）
          <input type="text" name="reason" value={reason} onChange={event => { setReason(event.target.value); setConfirmed(false); }}
            required maxLength={maxReason} />
        </label>
        <label>
          <input type="checkbox" name="confirm" value="yes" checked={confirmed}
            onChange={event => setConfirmed(event.target.checked)} required /> 我已核对账号、产品和授权天数。
        </label>
      </fieldset>
      {result?.ok
        ? <button className="btn btn-ghost" type="button" onClick={onNewGrant}>新建授权</button>
        : <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "授权中…" : "授予或延长 Pro"}</button>}
      <p role="status" className={result?.ok === false ? "form-error" : "notice"}>{result?.message}{result?.expiresAt && <>
        {" "}新到期时间 <time dateTime={result.expiresAt}>{new Date(result.expiresAt).toLocaleString("zh-CN", {
          timeZone: "Asia/Shanghai", dateStyle: "medium", timeStyle: "medium",
        })}</time>（北京时间）
      </>}</p>
    </form>
  );
}
