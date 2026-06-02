interface JwtPayload {
  exp?: number;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(
  token: string | null,
  bufferSeconds = 60,
): boolean {
  if (!token) {
    return true;
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  const expiresAtMs = payload.exp * 1000;
  const bufferMs = bufferSeconds * 1000;
  return Date.now() >= expiresAtMs - bufferMs;
}
