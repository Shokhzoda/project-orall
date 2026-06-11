import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (fullName: string, email: string, currentPassword?: string, newPassword?: string) => Promise<void>;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Helper to ensure a user object has the required username attribute
  const formatUserObj = (u: any): User | null => {
    if (!u) return null;
    return {
      ...u,
      username: u.username || u.email || u.full_name || "user"
    };
  };

  // Parse cached tokens at boot
  useEffect(() => {
    const cachedToken = localStorage.getItem("fashionhub_token");
    const cachedUser = localStorage.getItem("fashionhub_user");

    if (cachedToken && cachedUser) {
      try {
        setToken(cachedToken);
        const parsed = JSON.parse(cachedUser);
        setUser(formatUserObj(parsed));
      } catch (err) {
        localStorage.removeItem("fashionhub_token");
        localStorage.removeItem("fashionhub_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Secure customized fetch wrapper utilizing automated authorization attachment
  const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const currentToken = token || localStorage.getItem("fashionhub_token");
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    } as Record<string, string>;

    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }

    const mergedOptions = {
      ...options,
      headers,
    };

    const response = await fetch(endpoint, mergedOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP request failed: status ${response.status}`);
    }

    return data;
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.token && res.user) {
        const formattedUser = formatUserObj(res.user);
        if (formattedUser) {
          localStorage.setItem("fashionhub_token", res.token);
          localStorage.setItem("fashionhub_user", JSON.stringify(formattedUser));
          setToken(res.token);
          setUser(formattedUser);
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
      throw err;
    }
  };

  const register = async (username: string, password: string, role?: string) => {
    try {
      setError(null);
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: username,
          email: username,
          password,
          role: role || "Employee"
        }),
      });

      if (res.token && res.user) {
        const formattedUser = formatUserObj(res.user);
        if (formattedUser) {
          localStorage.setItem("fashionhub_token", res.token);
          localStorage.setItem("fashionhub_user", JSON.stringify(formattedUser));
          setToken(res.token);
          setUser(formattedUser);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to register.");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("fashionhub_token");
    localStorage.removeItem("fashionhub_user");
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (
    full_name: string,
    email: string,
    current_password?: string,
    new_password?: string
  ) => {
    try {
      setError(null);
      const res = await apiFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ full_name, email, current_password, new_password }),
      });

      if (res.user) {
        const formattedUser = formatUserObj(res.user);
        if (formattedUser) {
          if (res.token) {
            localStorage.setItem("fashionhub_token", res.token);
            setToken(res.token);
          }
          localStorage.setItem("fashionhub_user", JSON.stringify(formattedUser));
          setUser(formattedUser);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        error,
        clearError,
        login,
        register,
        logout,
        updateProfile,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be called inside an AuthProvider scope.");
  }
  return context;
}
