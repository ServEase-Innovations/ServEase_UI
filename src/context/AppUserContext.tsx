// AppUserContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";

const APP_USER_STORAGE_KEY = "serveaso_app_user";

function loadStoredAppUser(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(APP_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function clearStoredAuthSession(): void {
  localStorage.removeItem(APP_USER_STORAGE_KEY);
  localStorage.removeItem("token");
}

interface AppUserContextType {
  appUser: any | null;
  setAppUser: React.Dispatch<React.SetStateAction<any | null>>;
  authSessionReady: boolean;
}

const AppUserContext = createContext<AppUserContextType | undefined>(undefined);

function AuthSessionBridge({ onReady }: { onReady: () => void }) {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      onReady();
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        if (!cancelled && token) {
          localStorage.setItem("token", token);
        }
      } catch (err) {
        console.warn("Auth0 token refresh on load failed:", err);
      } finally {
        if (!cancelled) onReady();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, getAccessTokenSilently, onReady]);

  return null;
}

interface AppUserProviderProps {
  children: ReactNode;
}

export const AppUserProvider: React.FC<AppUserProviderProps> = ({ children }) => {
  const [appUser, setAppUserState] = useState<any | null>(() => loadStoredAppUser());
  const [authSessionReady, setAuthSessionReady] = useState(false);

  const setAppUser = useCallback<React.Dispatch<React.SetStateAction<any | null>>>(
    (value) => {
      setAppUserState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        if (next) {
          try {
            localStorage.setItem(APP_USER_STORAGE_KEY, JSON.stringify(next));
          } catch {
            /* ignore quota */
          }
        } else {
          localStorage.removeItem(APP_USER_STORAGE_KEY);
        }
        return next;
      });
    },
    []
  );

  const handleAuthReady = useCallback(() => setAuthSessionReady(true), []);

  return (
    <AppUserContext.Provider value={{ appUser, setAppUser, authSessionReady }}>
      <AuthSessionBridge onReady={handleAuthReady} />
      {children}
    </AppUserContext.Provider>
  );
};

export const useAppUser = (): AppUserContextType => {
  const context = useContext(AppUserContext);
  if (!context) {
    throw new Error("useAppUser must be used within an AppUserProvider");
  }
  return context;
};
