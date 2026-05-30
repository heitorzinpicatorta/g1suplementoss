import React, { createContext, useContext, useState, useEffect } from "react";

const AUTH_KEY = "g1-admin-token";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lê o JWT salvo e verifica se ainda não expirou (checagem no cliente — sem criptografia)
function loadToken(): string | null {
  try {
    const token = localStorage.getItem(AUTH_KEY);
    if (!token) return null;

    // JWT tem 3 partes separadas por "." — a segunda é o payload em base64
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresAt = payload.exp * 1000; // exp vem em segundos, Date usa ms

    if (Date.now() >= expiresAt) {
      // Token expirado — limpa e força novo login
      localStorage.removeItem(AUTH_KEY);
      return null;
    }

    return token;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Ao carregar, tenta recuperar sessão válida
    const saved = loadToken();
    setToken(saved);
  }, []);

  const login = async (user: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });

      if (!res.ok) return false;

      const { token: jwt } = await res.json();
      localStorage.setItem(AUTH_KEY, jwt);
      setToken(jwt);
      return true;
    } catch (error) {
      console.error("Erro ao conectar ao servidor:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Utilitário exportado para as API routes do frontend enviarem o token
// Uso: fetch("/api/orders", { headers: getAuthHeaders() })
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_KEY);
  } catch {
    return null;
  }
}
