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
  const [localProfile, setLocalProfile] = useState<Profile | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { data: serverProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["auth_user"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
      return await getCurrentUserServerFn({ data: token });
    },
    initialData: localProfile ?? undefined,
  });

  const profile = serverProfile ?? localProfile;

  const setAuth = (p: Profile, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
      localStorage.setItem(TOKEN_KEY, token);
      // Set document cookie
      document.cookie = `societydesk_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    }
    setLocalProfile(p);
    queryClient.setQueryData(["auth_user"], p);
    queryClient.invalidateQueries();
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = `societydesk_token=; path=/; max-age=0; SameSite=Lax`;
    }
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
        profileLoading,
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
