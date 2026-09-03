import bcrypt from "bcryptjs";
import type { Store, UserRow } from "../store/types.ts";
import { authBlockReason } from "./guards.ts";

export type LoginCheckOk = { ok: true; user: UserRow };
export type LoginCheckFail = {
  ok: false;
  status: 401 | 403;
  code?: "EMAIL_NOT_VERIFIED";
  error: string;
};

export async function checkLoginCredentials(
  store: Store,
  email: string,
  password: string
): Promise<LoginCheckOk | LoginCheckFail> {
  const user = await store.getUserByEmail(email.trim().toLowerCase());
  if (!user || user.deletedAt || !(await bcrypt.compare(password, user.passwordHash))) {
    return { ok: false, status: 401, error: "Email or password does not match" };
  }
  const block = authBlockReason(user);
  if (block === "unverified") {
    return {
      ok: false,
      status: 403,
      code: "EMAIL_NOT_VERIFIED",
      error: "Please verify your email before signing in.",
    };
  }
  if (block === "deleted") {
    return { ok: false, status: 401, error: "Email or password does not match" };
  }
  return { ok: true, user };
}
