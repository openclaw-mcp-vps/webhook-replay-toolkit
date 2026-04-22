export const ACCESS_COOKIE_NAME = "wrt_paid";
export const ACCESS_COOKIE_VALUE = "active";
export const ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function hasActiveAccessCookie(value?: string | null) {
  return value === ACCESS_COOKIE_VALUE;
}
