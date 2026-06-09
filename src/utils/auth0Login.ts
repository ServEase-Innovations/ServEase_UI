import type { AppState } from "@auth0/auth0-react";
import { AUTH0_DEFAULT_SCOPE } from "./auth0Token";

/** Popup login is only reliable on local dev; production hosts should redirect. */
export function prefersAuth0RedirectLogin(): boolean {
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

export function auth0LoginAppState(): AppState {
  return {
    returnTo: window.location.pathname + window.location.search,
  };
}

export function auth0LoginAuthorizationParams(
  prompt: "login" | "consent" = "login"
) {
  return {
    prompt,
    scope: AUTH0_DEFAULT_SCOPE,
  };
}
