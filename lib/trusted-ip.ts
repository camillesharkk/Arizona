/** Platform client IP. On Vercel, x-real-ip is overwritten by the platform. The left-most x-forwarded-for value is client-supplied and is not used there. */
export function trustedClientIp(req: Request) {
  if (process.env.VERCEL) {
    const real = req.headers.get("x-real-ip")?.trim();
    if (real) return real;
  }
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip")?.trim() || "local";
}
