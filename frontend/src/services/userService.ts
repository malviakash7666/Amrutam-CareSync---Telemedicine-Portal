import { apiCall } from "../authenticator/api";

export interface UserProfile {
  id: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  isActive: boolean;
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    emergencyContact?: any;
  };
  doctor?: {
    id: string;
    bio?: string;
    experienceYears: number;
    consultationFee: number;
    licenseNumber: string;
    isVerified: boolean;
    ratingAvg: number;
    ratingCount: number;
  };
}

export const userService = {
  /**
   * Log in user using email and password.
   */
  login: async (email: string, password: string): Promise<UserProfile> => {
    const res = await apiCall<UserProfile>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.user) {
      throw new Error(res.message || "Login succeeded but no user data returned.");
    }
    return res.user;
  },

  /**
   * Register a new patient or doctor account.
   */
  signup: async (data: {
    email: string;
    passwordHash: string; // password field
    role: "PATIENT" | "DOCTOR";
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<UserProfile> => {
    // Note: backend expects 'password', but we map it here
    const body = {
      email: data.email,
      password: data.passwordHash,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    };

    const res = await apiCall<UserProfile>("/users/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.user) {
      throw new Error(res.message || "Signup succeeded but no user data returned.");
    }
    return res.user;
  },

  /**
   * Log out active user and clear session cookies.
   */
  logout: async (): Promise<boolean> => {
    const res = await apiCall("/users/logout", {
      method: "POST",
    });
    return res.success;
  },

  /**
   * Fetch current session profile (authenticated by secure HTTP-only cookies).
   */
  getMe: async (): Promise<UserProfile> => {
    const res = await apiCall<UserProfile>("/users/me", {
      method: "GET",
    });
    if (!res.user) {
      throw new Error(res.message || "Failed to load authenticated session.");
    }
    return res.user;
  },

  /**
   * Silent session refresh using refresh cookies.
   */
  refreshSession: async (): Promise<boolean> => {
    const res = await apiCall("/users/refresh", {
      method: "POST",
    });
    return res.success;
  },
};
