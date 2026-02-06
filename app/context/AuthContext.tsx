"use client";

import { createContext, useState, useEffect, ReactNode } from "react";

type User = { email: string } | null;

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
});

type Props = { children: ReactNode };

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    // optional: fetch current user info from API on mount
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await res.json();
    setUser({ email }); // може да сетнеш и други данни от data
  };

  const logout = () => {
    setUser(null);
    // тук може да добавиш fetch към /api/logout ако имаш такъв
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
