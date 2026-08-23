import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUserServerFn, signOutServerFn, type AuthProfile } from "@/lib/auth.functions";

export type Profile = AuthProfile;

export type MockSession = {
  user: {
    id: string;
    email: string;
  };
};

type AuthValue = {
  session: MockSession | null;
  loading: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  isAdmin: boolean;
  setAuth: (profile: Profile, token: string) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  loading: true,
  profile: null,
  profileLoading: true,
  isAdmin: false,
  setAuth: () => {},
  signOut: async () => {},
});

const STORAGE_KEY = "societydesk_profile";
const TOKEN_KEY = "societydesk_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  });

  const [localProfile, setLocalProfile] = useState<Profile | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Keep auth state strictly in sync with storage & browser back/forward history buttons
  useEffect(() => {
    const syncAuthFromStorage = () => {
      const curToken = localStorage.getItem(TOKEN_KEY);
      const curStored = localStorage.getItem(STORAGE_KEY);
      setToken(curToken);
      if (curToken && curStored) {
        try {
          setLocalProfile(JSON.parse(curStored));
        } catch {
          setLocalProfile(null);
        }
      } else {
        setLocalProfile(null);
        queryClient.setQueryData(["auth_user"], null);
        queryClient.clear();
      }
    };

    window.addEventListener("storage", syncAuthFromStorage);
    window.addEventListener("popstate", syncAuthFromStorage);
    window.addEventListener("pageshow", syncAuthFromStorage);
    return () => {
      window.removeEventListener("storage", syncAuthFromStorage);
      window.removeEventListener("popstate", syncAuthFromStorage);
      window.removeEventListener("pageshow", syncAuthFromStorage);
    };
  }, [queryClient]);

  const { data: serverProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["auth_user"],
    queryFn: async () => {
      const curToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
      if (!curToken) return null;
      return await getCurrentUserServerFn({ data: curToken });
    },
    enabled: Boolean(token),
    initialData: token ? (localProfile ?? undefined) : undefined,
  });

  const profile = token ? (serverProfile ?? localProfile) : null;

  const setAuth = (p: Profile, newToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
      localStorage.setItem(TOKEN_KEY, newToken);
      // Set document cookie
      document.cookie = `societydesk_token=${newToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    }
    setToken(newToken);
    setLocalProfile(p);
    queryClient.setQueryData(["auth_user"], p);
    queryClient.invalidateQueries();
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.clear();
      document.cookie = `societydesk_token=; path=/; max-age=0; SameSite=Lax`;
    }
    setToken(null);
    setLocalProfile(null);
    queryClient.setQueryData(["auth_user"], null);
    queryClient.clear();
    await signOutServerFn();
  };

  const session: MockSession | null = profile
    ? {
        user: {
          id: profile.id,
          email: profile.email,
        },
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        session,
        loading: false,
        profile: profile ?? null,
        profileLoading: Boolean(token) && profileLoading,
        isAdmin: profile?.role === "admin",
        setAuth,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function signOutEverywhere() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `societydesk_token=; path=/; max-age=0; SameSite=Lax`;
  }
  await signOutServerFn();
}
