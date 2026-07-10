import React, { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { userService } from "../services/userService";
import type { UserProfile } from "../services/userService";

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, passwordHash: string) => Promise<void>;
  signup: (data: {
    email: string;
    passwordHash: string;
    role: "PATIENT" | "DOCTOR";
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session checks on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await userService.getMe();
        setUser(currentUser);
      } catch (err) {
        console.log("No active authenticated session found.");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (email: string, passwordHash: string) => {
    setLoading(true);
    try {
      const loggedInUser = await userService.login(email, passwordHash);
      setUser(loggedInUser);
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: {
    email: string;
    passwordHash: string;
    role: "PATIENT" | "DOCTOR";
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    setLoading(true);
    try {
      const registeredUser = await userService.signup(data);
      setUser(registeredUser);
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await userService.logout();
      setUser(null);
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
