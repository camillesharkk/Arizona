export const CONTACT_MESSAGE_MIN = 3;
export const CONTACT_MESSAGE_MAX = 4000;

export type PreferredContact = "Email" | "Phone";

export type ContactFieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  preferred?: string;
  message?: string;
};

export function normalizePreferred(raw: unknown): PreferredContact | null {
  const v = String(raw ?? "").trim().toLowerCase();
  if (v === "email") return "Email";
  if (v === "phone") return "Phone";
  return null;
}

/** Loose check: enough digits, common separators, no junk letters. */
export function phoneIsPlausible(raw: string): boolean {
  const s = raw.trim();
  if (!s || s.length > 40) return false;
  const digits = s.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return false;
  if (/[^+\d\s().-]/.test(s)) return false;
  return true;
}

export function validateContactInput(raw: {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  preferred?: unknown;
  message?: unknown;
}): { ok: true; data: { name: string; email: string; phone: string; preferred: PreferredContact; message: string } } | { ok: false; errors: ContactFieldErrors } {
  const errors: ContactFieldErrors = {};
  const name = String(raw.name ?? "").trim();
  const email = String(raw.email ?? "").trim();
  const phone = String(raw.phone ?? "").trim();
  const preferred = normalizePreferred(raw.preferred);
  const message = String(raw.message ?? "").trim();

  if (!name || name.length > 100) {
    errors.name = "Please enter your name.";
  }

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!preferred) {
    errors.preferred = "Please choose a preferred contact method.";
  }

  if (preferred === "Phone") {
    if (!phone) {
      errors.phone = "Please enter a phone number if you prefer to be contacted by phone.";
    } else if (!phoneIsPlausible(phone)) {
      errors.phone = "Please enter a valid phone number.";
    }
  } else if (phone && !phoneIsPlausible(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!message) {
    errors.message = "Please enter a message.";
  } else if (message.length < CONTACT_MESSAGE_MIN) {
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
