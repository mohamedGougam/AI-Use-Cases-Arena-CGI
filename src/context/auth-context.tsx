"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ADMIN_EMAIL,
  ARCHITECT_EMAIL,
  AUTH_STORAGE_KEY,
  BUSINESS_EMAIL,
  isAdminEmail,
  isAdminLogin,
  isArchitectEmail,
  isArchitectLogin,
  isBusinessEmail,
  isBusinessLogin,
  isParticipantEmail,
  normalizeEmail,
} from "@/lib/auth";
import { purgeNonParticipantAccounts, registerUserLogin } from "@/lib/login-registry";

interface AuthSession {
  email: string;
  isAdmin: boolean;
  isArchitect: boolean;
}

interface AuthContextValue {
  email: string | null;
  isAdmin: boolean;
  isArchitect: boolean;
  isBusiness: boolean;
  canAccessArchitectTools: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (input: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      email?: string;
      isAdmin?: boolean;
      isArchitect?: boolean;
      isBusiness?: boolean;
    };
    if (!parsed.email) return null;
    const normalized = normalizeEmail(parsed.email);
    if (parsed.isAdmin || isAdminEmail(normalized)) {
      return { email: ADMIN_EMAIL, isAdmin: true, isArchitect: false };
    }
    if (parsed.isArchitect || isArchitectEmail(normalized)) {
      return { email: ARCHITECT_EMAIL, isAdmin: false, isArchitect: true };
    }
    if (parsed.isBusiness || isBusinessEmail(normalized)) {
      return { email: BUSINESS_EMAIL, isAdmin: false, isArchitect: false };
    }
    if (isParticipantEmail(normalized)) {
      return { email: normalized, isAdmin: false, isArchitect: false };
    }
    return null;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      email: session.email,
      isAdmin: session.isAdmin,
      isArchitect: session.isArchitect,
      isBusiness: isBusinessEmail(session.email),
    })
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isArchitect, setIsArchitect] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    purgeNonParticipantAccounts();
    const session = loadSession();
    if (session) {
      setEmail(session.email);
      setIsAdmin(session.isAdmin);
      setIsArchitect(session.isArchitect);
      setIsBusiness(isBusinessEmail(session.email));
      saveSession(session);
      if (!session.isAdmin && !session.isArchitect) {
        registerUserLogin(session.email);
      }
    }
    setIsReady(true);
  }, []);

  const login = useCallback((rawInput: string) => {
    const trimmed = rawInput.trim();
    if (isAdminLogin(trimmed)) {
      setEmail(ADMIN_EMAIL);
      setIsAdmin(true);
      setIsArchitect(false);
      setIsBusiness(false);
      saveSession({ email: ADMIN_EMAIL, isAdmin: true, isArchitect: false });
      return true;
    }

    if (isArchitectLogin(trimmed)) {
      setEmail(ARCHITECT_EMAIL);
      setIsAdmin(false);
      setIsArchitect(true);
      setIsBusiness(false);
      saveSession({ email: ARCHITECT_EMAIL, isAdmin: false, isArchitect: true });
      return true;
    }

    if (isBusinessLogin(trimmed)) {
      setEmail(BUSINESS_EMAIL);
      setIsAdmin(false);
      setIsArchitect(false);
      setIsBusiness(true);
      saveSession({ email: BUSINESS_EMAIL, isAdmin: false, isArchitect: false });
      registerUserLogin(BUSINESS_EMAIL);
      return true;
    }

    const normalized = normalizeEmail(trimmed);
    if (!isParticipantEmail(normalized)) return false;
    setEmail(normalized);
    setIsAdmin(false);
    setIsArchitect(false);
    setIsBusiness(isBusinessEmail(normalized));
    saveSession({ email: normalized, isAdmin: false, isArchitect: false });
    registerUserLogin(normalized);
    return true;
  }, []);

  const logout = useCallback(() => {
    setEmail(null);
    setIsAdmin(false);
    setIsArchitect(false);
    setIsBusiness(false);
    saveSession(null);
  }, []);

  const value = useMemo(
    () => ({
      email,
      isAdmin,
      isArchitect,
      isBusiness,
      canAccessArchitectTools: isAdmin || isArchitect,
      isAuthenticated: Boolean(email),
      isReady,
      login,
      logout,
    }),
    [email, isAdmin, isArchitect, isBusiness, isReady, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
