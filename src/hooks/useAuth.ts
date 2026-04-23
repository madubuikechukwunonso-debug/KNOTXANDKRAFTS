import { useCallback, useEffect, useState } from "react";

type AuthUser = {
  id: number;
  username: string;
  email: string;
  name: string;
  role: "user" | "worker" | "admin" | "super_admin";
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("local_auth_token")
        : null;

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/session/me", {
        method: "GET",
        headers: {
          "x-local-auth-token": token,
        },
      });

      const data = await response.json();

      if (data?.ok && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("loadSession failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/session/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("logout failed:", error);
    } finally {
      localStorage.removeItem("local_auth_token");
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  const role = user?.role ?? "user";
  const isAuthenticated = Boolean(user);
  const isAdmin = role === "admin" || role === "super_admin";
  const isWorker = role === "worker" || isAdmin;

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isWorker,
    logout,
    refreshSession: loadSession,
  };
}
