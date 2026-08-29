const USERS_KEY = "az-notary-users";
const SESSION_KEY = "az-notary-session";
export const AUTH_EVENT = "az-notary-auth";

export type StoredAccount = {
  email: string;
  createdAt: string;
  salt: string;
  hash: string;
};

function emitAuth() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function readUsers(): Record<string, StoredAccount> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, StoredAccount>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function bufToB64(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  bytes.forEach((b) => {
    s += String.fromCharCode(b);
  });
  return btoa(s);
}

function b64ToBuf(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hashPassword(password: string, saltBytes: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes as BufferSource, iterations: 100000, hash: "SHA-256" },
    key,
    256
  );
  return bufToB64(bits);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function currentEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function isLoggedIn() {
  return !!currentEmail();
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  emitAuth();
}

export async function registerAccount(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = normalizeEmail(email);
  if (!isValidEmail(key)) return { ok: false, error: "Enter a valid email." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  const users = readUsers();
  if (users[key]) return { ok: false, error: "That email already has an account on this device." };
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPassword(password, salt);
  users[key] = { email: key, createdAt: new Date().toISOString(), salt: bufToB64(salt), hash };
  writeUsers(users);
  const { mergeGuestIntoAccount } = await import("@/lib/storage");
  mergeGuestIntoAccount(key);
  localStorage.setItem(SESSION_KEY, key);
  emitAuth();
  return { ok: true };
}

export async function loginAccount(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = normalizeEmail(email);
  const users = readUsers();
  const user = users[key];
  if (!user) return { ok: false, error: "No account found for that email on this device." };
  const hash = await hashPassword(password, b64ToBuf(user.salt));
  if (hash !== user.hash) return { ok: false, error: "Email or password does not match." };
  const { mergeGuestIntoAccount } = await import("@/lib/storage");
  mergeGuestIntoAccount(key);
  localStorage.setItem(SESSION_KEY, key);
  emitAuth();
  return { ok: true };
}

export function subscribeAuth(cb: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => cb();
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
