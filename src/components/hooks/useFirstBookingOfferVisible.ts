import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAppUser } from "src/context/AppUserContext";
import {
  isEligibleForFirstBookingOffer,
  resolveCustomerId,
} from "src/services/couponService";

function hasOtpAuthSession(appUser: unknown): boolean {
  if (!appUser || typeof appUser !== "object") return false;
  try {
    return !!localStorage.getItem("token");
  } catch {
    return false;
  }
}

/**
 * Hot Deal (₹99 / NEWUSER) visibility:
 * - Guest (not signed in): show
 * - Signed-in customer with zero prior bookings + NEWUSER eligible: show
 * - Everyone else: hide
 */
export function useFirstBookingOfferVisible() {
  const { appUser, authSessionReady } = useAppUser();
  const { isAuthenticated: auth0IsAuthenticated } = useAuth0();

  const [showOffer, setShowOffer] = useState(false);
  const [checking, setChecking] = useState(true);

  const isAuthenticated = useMemo(
    () => auth0IsAuthenticated || hasOtpAuthSession(appUser),
    [auth0IsAuthenticated, appUser]
  );

  const role = useMemo(() => {
    const fromApp = String(appUser?.role || "").toUpperCase();
    if (fromApp) return fromApp;
    return auth0IsAuthenticated ? "CUSTOMER" : "";
  }, [appUser?.role, auth0IsAuthenticated]);

  const customerId = useMemo(() => resolveCustomerId(appUser), [appUser]);

  const evaluate = useCallback(async () => {
    if (!authSessionReady) {
      setChecking(true);
      return;
    }

    if (!isAuthenticated) {
      setShowOffer(true);
      setChecking(false);
      return;
    }

    if (role !== "CUSTOMER") {
      setShowOffer(false);
      setChecking(false);
      return;
    }

    if (!customerId) {
      setShowOffer(false);
      setChecking(false);
      return;
    }

    setChecking(true);
    try {
      const eligible = await isEligibleForFirstBookingOffer(customerId);
      setShowOffer(eligible);
    } catch {
      setShowOffer(false);
    } finally {
      setChecking(false);
    }
  }, [authSessionReady, isAuthenticated, role, customerId]);

  useEffect(() => {
    void evaluate();
  }, [evaluate]);

  useEffect(() => {
    const onFocus = () => {
      if (isAuthenticated && role === "CUSTOMER" && customerId) {
        void evaluate();
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [evaluate, isAuthenticated, role, customerId]);

  return { showOffer, checking };
}
