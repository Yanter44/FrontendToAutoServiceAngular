const ACCESS_COOKIE_NAMES = ['jwt'];
const REFRESH_COOKIE_NAMES = ['jwtrefresh'];

function cookieMap(): Map<string, string> {
  const map = new Map<string, string>();
  if (typeof document === 'undefined' || !document.cookie) {
    return map;
  }
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    const name = eq >= 0 ? trimmed.slice(0, eq) : trimmed;
    const value = eq >= 0 ? decodeURIComponent(trimmed.slice(eq + 1)) : '';
    map.set(name, value);
    map.set(name.toLowerCase(), value);
  }
  return map;
}

function hasNamedCookie(cookies: Map<string, string>, names: string[]): boolean {
  return names.some(name => {
    const value = cookies.get(name) ?? cookies.get(name.toLowerCase());
    return !!value;
  });
}

export function hasJwtCookie(): boolean {
  return hasNamedCookie(cookieMap(), ACCESS_COOKIE_NAMES);
}

export function hasRefreshTokenCookie(): boolean {
  return hasNamedCookie(cookieMap(), REFRESH_COOKIE_NAMES);
}

/** Куки jwt и jwtrefresh — HttpOnly, в document.cookie их нет. По этому списку нельзя решать, вызывать ли RefreshToken. */
export function hasNoAuthCookies(): boolean {
  return false;
}
