import assert from "node:assert/strict";
import { testLoader } from "./pack-test-utils.mjs";

let session = null;
let reads = 0;
const grants = [];
const requestId = "a7951cde-fbc3-4df0-9e91-922862252b48";
const load = testLoader({
  "@/lib/session": { getSession: async () => session },
  "@/lib/manual-pro": {
    listManualProGrants: async () => { reads++; return []; },
    grantManualPro: async (input, actor) => {
      grants.push({ input, actor });
      return { duplicate: false, receipt: { expiresAt: "2027-01-18T10:00:00.000Z" } };
    },
  },
  "next/cache": { revalidatePath: () => {} },
  "next/navigation": { redirect: (href) => { throw new Error(href); } },
  "../operations/report.module.css": {},
  "./grant-form": { GrantForm: () => null },
});

const { submitProGrant } = load("app/admin/pro-grants/actions.ts");
const { default: ManualProAdmin } = load("app/admin/pro-grants/page.tsx");

function form(overrides = {}) {
  const values = {
    requestId, email: "learner@example.invalid", productCode: "az_exam_pro_60d",
    days: "60", reason: "测试账号续期", confirm: "yes", actorId: "injected",
    ...overrides,
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

function textOf(node) {
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node === "string") return node;
  return node?.props ? textOf(node.props.children) : "";
}

const previous = process.env.OPERATIONS_ADMIN_EMAILS;
process.env.OPERATIONS_ADMIN_EMAILS = "operator@example.invalid";
try {
  await assert.rejects(ManualProAdmin, /\/login\/\?next=%2Fadmin%2Fpro-grants%2F/);
  assert.equal((await submitProGrant(null, form())).ok, false);
  session = { id: "member", email: "learner@example.invalid" };
  assert.equal((await submitProGrant(null, form())).ok, false);
  assert.match(textOf(await ManualProAdmin()), /无权查看/);
  assert.equal(reads, 0);
  assert.equal(grants.length, 0);
  session = { id: "operator", email: "operator@example.invalid" };
  assert.match(textOf(await ManualProAdmin()), /授予或延长 Pro/);
  assert.equal(reads, 1);
  for (const input of [{ confirm: "" }, { days: "0" }, { days: "60.5" }, { productCode: "all_state_pro_lifetime" }]) {
    assert.equal((await submitProGrant(null, form(input))).ok, false);
  }
  assert.equal(grants.length, 0);
  assert.equal((await submitProGrant(null, form())).ok, true);
  assert.equal(grants.length, 1);
  assert.equal(grants[0].actor.kind, "administrator");
  assert.equal(grants[0].actor.id, "operator");
  assert.equal(grants[0].input.requestId, requestId);
  assert.equal(grants[0].input.days, 60);
  console.log("Manual Pro admin page and actions: unauthorized callers denied, explicit confirmation, validated duration and product, session-derived actor.");
} finally {
  if (previous === undefined) delete process.env.OPERATIONS_ADMIN_EMAILS;
  else process.env.OPERATIONS_ADMIN_EMAILS = previous;
}
