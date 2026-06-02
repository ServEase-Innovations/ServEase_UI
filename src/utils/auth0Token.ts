import type { GetTokenSilentlyOptions, PopupLoginOptions } from "@auth0/auth0-react";

export const AUTH0_DEFAULT_SCOPE = "openid profile email offline_access";

type GetAccessTokenSilently = (
  options?: GetTokenSilentlyOptions
) => Promise<string>;

type LoginWithPopup = (options?: PopupLoginOptions) => Promise<void>;

function auth0ErrorCode(err: unknown): string {
  return String((err as { error?: string })?.error ?? "");
}

function auth0ErrorMessage(err: unknown): string {
  return String((err as { message?: string })?.message ?? err ?? "");
}

export function isAuth0ConsentRequired(err: unknown): boolean {
  const code = auth0ErrorCode(err);
  const message = auth0ErrorMessage(err);
  return code === "consent_required" || message.includes("Consent required");
}

function isMissingRefreshTokenError(err: unknown): boolean {
  const message = auth0ErrorMessage(err);
  const code = auth0ErrorCode(err);
  return (
    message.includes("Missing Refresh Token") ||
    code === "missing_refresh_token"
  );
}

const consentAuthParams = {
  scope: AUTH0_DEFAULT_SCOPE,
  prompt: "consent" as const,
};

let interactiveAuthInFlight: Promise<void> | null = null;

async function runConsentPopup(loginWithPopup: LoginWithPopup): Promise<void> {
  if (!interactiveAuthInFlight) {
    interactiveAuthInFlight = loginWithPopup({
      authorizationParams: consentAuthParams,
    }).finally(() => {
      interactiveAuthInFlight = null;
    });
  }
  await interactiveAuthInFlight;
}

/**
 * Fetches an access token; opens Auth0 consent popup when required for new scopes
 * (e.g. offline_access) or when refresh token is missing.
 */
export async function resolveAccessToken(
  getAccessTokenSilently: GetAccessTokenSilently,
  loginWithPopup?: LoginWithPopup
): Promise<string> {
  try {
    return await getAccessTokenSilently();
  } catch (err) {
    if (!loginWithPopup) {
      throw err;
    }

    if (isAuth0ConsentRequired(err) || isMissingRefreshTokenError(err)) {
      await runConsentPopup(loginWithPopup);
      return getAccessTokenSilently();
    }

    throw err;
  }
}

/** @deprecated Use resolveAccessToken */
export async function getAccessTokenSafe(
  getAccessTokenSilently: GetAccessTokenSilently
): Promise<string> {
  return getAccessTokenSilently();
}
