function state() {
  if (!globalThis.__azSessionCookieTest) {
    globalThis.__azSessionCookieTest = {
      token: undefined,
      deletes: [],
      mode: "ok",
      device: null,
      user: null,
      repoError: null,
      touched: null,
    };
  }
  return globalThis.__azSessionCookieTest;
}

const READONLY_COOKIE_MESSAGE =
  "Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options";

export async function cookies() {
  const current = state();
  return {
    get(name) {
      if (name !== "az_session" || !current.token) return undefined;
      return { name, value: current.token };
    },
    delete(name) {
      current.deletes.push(name);
      if (current.mode === "readonly") {
        const error = new Error(READONLY_COOKIE_MESSAGE);
        error.name = "eS";
        throw error;
      }
      if (current.mode === "other") throw new Error("cookie-backend-failed");
    },
    set() {
      throw new Error("session cookie set was not expected");
    },
  };
}

export async function getDeviceRepo() {
  const current = state();
  if (current.repoError) throw current.repoError;
  return {
    async getSession() {
      return current.device;
    },
    async touchSession(_id, at) {
      current.touched = at;
      if (current.device) current.device.lastSeenAt = at;
    },
  };
}

export async function getStore() {
  const current = state();
  return {
    async getUserById() {
      return current.user;
    },
  };
}
