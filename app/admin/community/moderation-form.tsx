"use client";

import { useActionState, useId, useState } from "react";
import { moderateCommunity } from "./actions";
import type { CommunityAdminInput } from "@/lib/community-admin-input";

const labels: Record<CommunityAdminInput["action"], string> = {
  hide: "隐藏内容",
  restore: "恢复公开",
  approve: "审核通过并发布",
  reject: "审核不通过并隐藏",
  warn: "向作者发送站内警告",
  ban: "封禁作者的社区权限",
  unban: "解除作者的社区封禁",
  "resolve-report": "标记举报为已处理",
};

export function ModerationForm({ id, choices }: {
  id: string;
  choices: [CommunityAdminInput["action"], ...CommunityAdminInput["action"][]];
}) {
  const [result, submit, pending] = useActionState(moderateCommunity, null);
  const [action, setAction] = useState(choices[0]);
  const [reason, setReason] = useState("");
  const titleId = useId();
  const selected = choices.includes(action) ? action : choices[0];

  return (
    <form action={submit} aria-labelledby={titleId}>
      <h3 id={titleId}>处理操作</h3>
      <input type="hidden" name="id" value={id} />
      <label className="field">
        操作
        <select name="action" value={selected} onChange={(event) => setAction(event.target.value as typeof action)}>
          {choices.map((choice) => <option key={choice} value={choice}>{labels[choice]}</option>)}
        </select>
      </label>
      <label className="field">
        原因（必填，3–400 字）
        <textarea name="reason" rows={3} required minLength={3} maxLength={400} value={reason}
          onChange={(event) => setReason(event.target.value)} />
      </label>
      {selected === "warn" && <p className="notice">警告原因会显示给该用户。</p>}
      {selected === "restore" && (
        <p><label><input type="checkbox" name="confirm" value="yes" required /> 我已审核此内容，确认恢复公开。</label></p>
      )}
      <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "保存中…" : "保存处理结果"}</button>
      <p role="status" className={result?.ok === false ? "form-error" : "notice"}>{result?.message}</p>
    </form>
  );
}
