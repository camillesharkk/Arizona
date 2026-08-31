export const CONTACT_MESSAGE_MIN = 3;
export const CONTACT_MESSAGE_MAX = 4000;
export const CONTACT_PHONE_MAX = 30;
export const CONTACT_NAME_MAX = 100;
export const CONTACT_EMAIL_MAX = 254;
export const CONTACT_PHONE_MIN_DIGITS = 7;
export const CONTACT_PHONE_MAX_DIGITS = 15;

export type PreferredContact = "Email" | "Phone";

export type ContactFieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  preferred?: string;
  message?: string;
};

export function normalizeRequiredText(value: unknown): string {
  return String(value ?? "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim();
}

export function normalizePreferred(raw: unknown): PreferredContact | null {
  const v = normalizeRequiredText(raw).toLowerCase();
  if (v === "email") return "Email";
  if (v === "phone") return "Phone";
  return null;
}

export function phoneIsPlausible(raw: string): boolean {
  const s = normalizeRequiredText(raw);
  if (!s || s.length > CONTACT_PHONE_MAX) return false;
  const digits = s.replace(/\D/g, "");
  if (digits.length < CONTACT_PHONE_MIN_DIGITS || digits.length > CONTACT_PHONE_MAX_DIGITS) return false;
  if (/[^+\d\s().-]/.test(s)) return false;
  return true;
}

export function validateContactInput(raw: {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  preferred?: unknown;
  preferredContact?: unknown;
  message?: unknown;
}):
  | { ok: true; data: { name: string; email: string; phone: string; preferred: PreferredContact; message: string } }
  | { ok: false; errors: ContactFieldErrors } {
  const errors: ContactFieldErrors = {};
  const name = normalizeRequiredText(raw.name);
  const email = normalizeRequiredText(raw.email);
  const phone = normalizeRequiredText(raw.phone);
  const preferred = normalizePreferred(raw.preferred ?? raw.preferredContact);
  const message = normalizeRequiredText(raw.message);

  if (!name || name.length > CONTACT_NAME_MAX) {
    errors.name = "Please enter your name.";
  }

  if (!email || email.length > CONTACT_EMAIL_MAX || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!preferred) {
    errors.preferred = "Please choose a preferred contact method.";
  }

  if (!phone) {
    errors.phone = "Please enter your phone number.";
  } else if (!phoneIsPlausible(phone)) {
    errors.phone = "Please enter your phone number.";
  }

  if (!message || message.length < CONTACT_MESSAGE_MIN) {
    errors.message = "Please enter a message.";
  } else if (message.length > CONTACT_MESSAGE_MAX) {
    errors.message = "Please enter a shorter message.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      preferred: preferred as PreferredContact,
      message,
    },
  };
}
