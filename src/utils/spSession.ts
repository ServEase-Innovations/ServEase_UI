import { resolveProviderId } from "./providerId";

export function resolveProviderIdNumber(
  appUser: Record<string, unknown> | null | undefined
): number | null {
  const raw = resolveProviderId(appUser);
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

/** True when this session should receive SP booking sockets + provider in-app notifications. */
export function isProviderNotificationSession(
  appUser: Record<string, unknown> | null | undefined
): boolean {
  if (!appUser) return false;
  if (resolveProviderIdNumber(appUser) == null) return false;
  const role = String(appUser.role || "").toUpperCase();
  if (role === "SERVICE_PROVIDER") return true;
  // Dual-role (customer + SP): check-email sets dual_role + serviceProviderId together.
  // Do not treat legacy serviceproviderid alone as SP session — it breaks customer inbox / badge.
  if (role === "CUSTOMER") {
    return appUser.dual_role === true || appUser.serviceProviderId != null;
  }
  return appUser.dual_role === true;
}
