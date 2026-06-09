import React, { ReactNode } from "react";
import { Auth0Provider, AppState } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const domain =
  process.env.REACT_APP_AUTH0_DOMAIN?.trim() || "dev-plavkbiy7v55pbg4.us.auth0.com";
const clientId =
  process.env.REACT_APP_AUTH0_CLIENT_ID?.trim() || "FkZvRgSNTXloPOo2ZVRmt24MbTrfIusi";

const auth0AuthorizationParams: {
  redirect_uri: string;
  scope: string;
  audience?: string;
} = {
  redirect_uri: window.location.origin,
  scope: "openid profile email offline_access",
};

const auth0Audience = process.env.REACT_APP_AUTH0_AUDIENCE?.trim();
if (auth0Audience) {
  auth0AuthorizationParams.audience = auth0Audience;
}

export function Auth0ProviderWithNavigate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: AppState) => {
    const returnTo = appState?.returnTo || window.location.pathname;
    navigate(returnTo, { replace: true });
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      useRefreshTokensFallback={true}
      authorizationParams={auth0AuthorizationParams}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}
