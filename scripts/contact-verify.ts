/**
 * Contact form validation gate. Run: npm run contact:verify
 * Does not call Resend. Asserts the shared validator used by the form and API.
 */
import { validateContactInput } from "../lib/contact-validation.ts";

let failures = 0;

function expectReject(label: string, raw: Record<string, unknown>, field?: "name" | "email" | "phone" | "preferred" | "message") {
  const r = validateContactInput(raw);
  if (r.ok) {
    failures += 1;
    console.log(`FAIL  ${label}: expected reject`);
    return;
  }
  if (field && !r.errors[field]) {
    failures += 1;
    console.log(`FAIL  ${label}: missing field error for ${field}`, r.errors);
    return;
  }
  console.log(`PASS  ${label}: reject`);
}

function expectAllow(label: string, raw: Record<string, unknown>) {
  const r = validateContactInput(raw);
  if (!r.ok) {
    failures += 1;
    console.log(`FAIL  ${label}: expected allow`, r.errors);
    return;
  }
  console.log(`PASS  ${label}: allow`);
}

const base = {
  name: "Test",
  email: "valid@example.com",
  preferred: "Email",
  phone: "6025550101",
  message: "Valid message",
};

expectReject("blank phone", { ...base, phone: "" }, "phone");
expectReject("whitespace phone", { ...base, phone: "   " }, "phone");
expectReject("null phone", { ...base, phone: null as unknown as string }, "phone");
expectReject("invalid phone abc", { ...base, phone: "abc" }, "phone");
expectReject("short phone 12", { ...base, phone: "12" }, "phone");
expectReject("phone xxxxxxxxxx", { ...base, phone: "xxxxxxxxxx" }, "phone");
expectAllow("valid phone 6025550101", { ...base, phone: "6025550101" });
expectAllow("valid phone formatted", { ...base, phone: "(602) 555-0101" });
expectAllow("valid phone plus", { ...base, phone: "+1 602 555 0101" });
expectReject("blank message", { ...base, message: "" }, "message");
expectReject("whitespace-only message", { ...base, message: "        " }, "message");
expectReject("newline message", { ...base, message: "\n\t     " }, "message");
expectReject("zero-width-only message", { ...base, message: "\u200B\u200B\u200B" }, "message");
expectReject("Hi is 2 chars", { ...base, message: "Hi" }, "message");
expectAllow("Hi! is 3 chars", { ...base, message: "Hi!" });
expectReject("email preferred still requires phone", { ...base, preferred: "Email", phone: "", message: "Valid message" }, "phone");

console.log("");
console.log(`contact:verify  failures=${failures}`);
if (failures > 0) process.exit(1);
