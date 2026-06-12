export function normalizeAdminRole(role: string | null | undefined): string {
  return String(role ?? "").trim();
}

export function isPendingAdminRole(role: string | null | undefined): boolean {
  return normalizeAdminRole(role).toLowerCase() === "user";
}

export function isActiveAdminRole(role: string | null | undefined): boolean {
  const r = normalizeAdminRole(role).toLowerCase();
  return r === "admin" || r === "superadmin";
}
