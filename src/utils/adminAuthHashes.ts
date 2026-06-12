/** SHA-256 hex — must match services/utils/lib/userCredentials.js */

export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildAdminLoginPayload(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const [usernameHash, passwordHash] = await Promise.all([
    sha256Hex(normalizedUsername),
    sha256Hex(password),
  ]);
  return { usernameHash, passwordHash };
}

/** Register body: hashes on the wire plus username for Mongo (legacy unique index). */
export async function buildAdminRegisterPayload(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const loginPayload = await buildAdminLoginPayload(normalizedUsername, password);
  return { ...loginPayload, username: normalizedUsername };
}
