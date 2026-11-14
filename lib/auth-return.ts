export const AUTH_RETURN_COOKIE = 'np_auth_return';

export function safeAuthReturn(value: string | null | undefined): string | null {
  if (
    !value || value.length > 2048 || !value.startsWith('/') ||
    value.startsWith('//') || value.startsWith('/\\') || /[\u0000-\u001f]/.test(value)
  ) return null;
  return value;
}
