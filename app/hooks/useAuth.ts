"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/app/lib/api/auth";

type User = Record<string, any> | null;

export function useAuth() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      console.log('🟢 useAuth: Loading user on mount');
      try {
        const userData = await authApi.fetchMe();
        console.log('🟢 useAuth: User loaded:', userData);
        setUser(userData);
      } catch (err) {
        console.log('🟢 useAuth: No user session', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🟢 useAuth: Logging in...');
      const data = await authApi.login(email, password);
      console.log('🟢 useAuth: Login successful, fetching user data...');
      // Después del login, obtener los datos del usuario desde /me
      const userData = await authApi.fetchMe();
      console.log('🟢 useAuth: Setting user:', userData);
      setUser(userData);
      return data;
    } catch (err: any) {
      console.error('🟢 useAuth: Login error:', err);
      setError(err?.message || "Login error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, passwordConfirmation: string, language: string = "es") => {
      setLoading(true);
      setError(null);
      try {
        const data = await authApi.register(name, email, password, passwordConfirmation, language);
        // Después del registro, obtener los datos del usuario desde /me
        const userData = await authApi.fetchMe();
        setUser(userData);
        return data;
      } catch (err: any) {
        setError(err?.message || "Register error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
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

  return { user, loading, error, login, register, logout } as const;
}

export default useAuth;
