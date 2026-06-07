import { resolveCustomerId } from "src/services/couponService";

/** True when a bearer token is stored (Auth0 or phone OTP). */
export function hasStoredAuthToken(): boolean {
  try {
    return Boolean(localStorage.getItem("token"));
  } catch {
    return false;
  }
}

/**
 * App session is active when Auth0 reports authenticated OR phone OTP stored
 * appUser + token (same rules as Header / Bookings).
 */
export function isAppSessionAuthenticated(
  appUser: unknown,
  auth0IsAuthenticated: boolean
): boolean {
  return auth0IsAuthenticated || Boolean(appUser && hasStoredAuthToken());
}

/**
 * Customer can checkout when we have a customer id and an active session token.
 */
export function isCustomerCheckoutReady(
  appUser: unknown,
  auth0IsAuthenticated: boolean
): boolean {
  const customerId = resolveCustomerId(appUser);
  if (!customerId) return false;
  return isAppSessionAuthenticated(appUser, auth0IsAuthenticated);
}
