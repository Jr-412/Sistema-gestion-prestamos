import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setToken } from "@/lib/token";
import { AuthToken, AuthTokenRole } from "@workspace/api-client-react";

interface AuthState {
  token: string | null;
  role: AuthTokenRole | null;
  email: string | null;
}

interface AuthContextType extends AuthState {
  login: (data: AuthToken) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        setToken(parsed.token);
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse auth from localStorage", e);
    }
    return { token: null, role: null, email: null };
  });

  const login = (data: AuthToken) => {
    setAuth(data);
    setToken(data.token);
    localStorage.setItem("auth", JSON.stringify(data));
  };

  const logout = () => {
    setAuth({ token: null, role: null, email: null });
    setToken(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ ...auth, isAuthenticated: !!auth.token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
