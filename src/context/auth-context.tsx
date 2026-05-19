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
  AUTH_STORAGE_KEY,
  isAdminLogin,
  isValidEmail,
  normalizeEmail,
} from "@/lib/auth";
import { registerUserLogin } from "@/lib/login-registry";

interface AuthSession {
  email: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  email: string | null;
  isAdmin: boolean;
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
    const parsed = JSON.parse(raw) as { email?: string; isAdmin?: boolean };
    if (!parsed.email) return null;
    if (parsed.isAdmin && parsed.email === ADMIN_EMAIL) {
      return { email: ADMIN_EMAIL, isAdmin: true };
    }
    if (isValidEmail(parsed.email)) {
      return { email: normalizeEmail(parsed.email), isAdmin: false };
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
    JSON.stringify({ email: session.email, isAdmin: session.isAdmin })
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session) {
      setEmail(session.email);
      setIsAdmin(session.isAdmin);
      if (!session.isAdmin) {
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
      saveSession({ email: ADMIN_EMAIL, isAdmin: true });
      return true;
    }

    const normalized = normalizeEmail(trimmed);
    if (!isValidEmail(normalized)) return false;
    setEmail(normalized);
    setIsAdmin(false);
    saveSession({ email: normalized, isAdmin: false });
    registerUserLogin(normalized);
    return true;
  }, []);

  const logout = useCallback(() => {
    setEmail(null);
    setIsAdmin(false);
    saveSession(null);
  }, []);

  const value = useMemo(
    () => ({
      email,
      isAdmin,
      isAuthenticated: Boolean(email),
      isReady,
      login,
      logout,
    }),
    [email, isAdmin, isReady, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
