/** Must match utils/payments ADMIN_PUSH_SECRET (header X-Admin-Push-Secret). */
export function getAdminPushSecret(): string | undefined {
  const v = process.env.REACT_APP_ADMIN_PUSH_SECRET?.trim();
  return v || undefined;
}

export function isAdminUtilsRequest(url?: string): boolean {
  if (!url) return false;
  if (url.includes("/api/platform-settings/public")) return false;
  return (
    url.includes("/api/platform-settings") ||
    url.includes("/api/platform-status") ||
    url.includes("/records") ||
    url.includes("/user-settings") ||
    url.includes("/delete-all") ||
    url.includes("/upload") ||
    /^\/users(\/|$)/.test(url)
  );
}

export function isAdminPaymentsRequest(url?: string): boolean {
  return Boolean(url?.includes("/api/admin/"));
}

/** Providers admin list routes (require X-Admin-Push-Secret when JWT_PROTECT_READS is on). */
export function isAdminProvidersRequest(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes("/api/customers") ||
    url.includes("/api/service-providers/providers") ||
    /\/api\/service-providers\/serviceprovider\/\d+/.test(url)
  );
}
