import paymentInstance from "./paymentInstance";
import { loadAdminSession } from "src/utils/adminSession";

export function getAdminAlertUserId(): string | null {
  const session = loadAdminSession();
  const id = session?.userId?.trim() || session?.usernameHash?.trim();
  return id || null;
}

export async function fetchAdminAlertReadKeys(adminUserId: string): Promise<Set<string>> {
  const { data } = await paymentInstance.get<{
    success: boolean;
    readKeys?: string[];
  }>("/api/admin/alert-reads", {
    params: { admin_user_id: adminUserId },
  });
  return new Set(data?.readKeys ?? []);
}

export async function saveAdminAlertReadKeys(
  adminUserId: string,
  alertKeys: string[]
): Promise<void> {
  const unique = Array.from(new Set(alertKeys.map((k) => k.trim()).filter(Boolean)));
  if (unique.length === 0) return;
  await paymentInstance.post("/api/admin/alert-reads", {
    admin_user_id: adminUserId,
    alertKeys: unique,
  });
}
