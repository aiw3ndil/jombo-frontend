"use client";

import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/app/lib/api/auth";

type User = Record<string, any> | null;

interface AuthContextType {
  user: User;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    console.log('🟢 AuthContext: Refreshing user');
    try {
      const userData = await authApi.fetchMe();
      console.log('🟢 AuthContext: User loaded:', userData);
      setUser(userData);
    } catch (err) {
      console.log('🟢 AuthContext: No user session', err);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      console.log('🟢 AuthContext: Loading user on mount');
      await refreshUser();
      setLoading(false);
    };
    loadUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🟢 AuthContext: Logging in...');
      const data = await authApi.login(email, password);
      console.log('🟢 AuthContext: Login successful, data:', data);
      
      // Si el login devuelve el usuario directamente, usarlo
      if (data.user) {
        console.log('🟢 AuthContext: Setting user from login response:', data.user);
        setUser(data.user);
      } else {
        // Si no, intentar cargar desde /me
        console.log('🟢 AuthContext: Fetching user from /me...');
        await refreshUser();
      }
      
      return data;
    } catch (err: any) {
      console.error('🟢 AuthContext: Login error:', err);
      setError(err?.message || "Login error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  const register = useCallback(
    async (name: string, email: string, password: string, passwordConfirmation: string, language: string = "es") => {
      setLoading(true);
      setError(null);
      try {
        console.log('🟢 AuthContext: Registering user...');
        const data = await authApi.register(name, email, password, passwordConfirmation, language);
        console.log('🟢 AuthContext: Register successful, data:', data);
        
        // Si el register devuelve el usuario directamente, usarlo
        if (data.user) {
          console.log('🟢 AuthContext: Setting user from register response:', data.user);
          setUser(data.user);
        } else {
          // Si no, intentar cargar desde /me
          console.log('🟢 AuthContext: Fetching user from /me...');
          await refreshUser();
        }
        
        return data;
      } catch (err: any) {
        console.error('🟢 AuthContext: Register error:', err);
        setError(err?.message || "Register error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // Continuar con el logout local aunque falle el servidor
    }
    setUser(null);
    try {
      router.push("/");
    } catch (_) {}
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, refreshUser }}>
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
