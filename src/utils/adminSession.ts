const STORAGE_KEY = "serveaso_admin_session";

export type AdminSession = {
  role: string;
  userId?: string;
  usernameHash?: string;
  expiresAt: number;
};

/** Default 8h; override with REACT_APP_ADMIN_SESSION_MINUTES */
export function getSessionTtlMs(): number {
  const mins = Number(process.env.REACT_APP_ADMIN_SESSION_MINUTES);
  if (Number.isFinite(mins) && mins > 0) {
    return mins * 60 * 1000;
  }
  return 8 * 60 * 60 * 1000;
}

export function saveAdminSession(
  session: Omit<AdminSession, "expiresAt"> & { expiresAt?: number }
): void {
  const payload: AdminSession = {
    role: session.role,
    userId: session.userId,
    usernameHash: session.usernameHash,
    expiresAt: session.expiresAt ?? Date.now() + getSessionTtlMs(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
}

export function loadAdminSession(): AdminSession | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
  } catch {
    raw = sessionStorage.getItem(STORAGE_KEY);
  }
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.role || !parsed.expiresAt) {
      clearAdminSession();
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      clearAdminSession();
      return null;
    }
    return parsed;
  } catch {
    clearAdminSession();
    return null;
  }
}

/** Extend expiry while the admin is active */
export function touchAdminSession(): void {
  const current = loadAdminSession();
  if (current) {
    saveAdminSession(current);
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem("adminUsernameHash");
}

export function isAdminSessionActive(): boolean {
  return loadAdminSession() != null;
}
