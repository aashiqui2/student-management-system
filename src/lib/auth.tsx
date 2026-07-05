import { createContext, useContext, useEffect, useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { toast } from "sonner";

export type Role = "ADMIN" | "STAFF" | "STUDENT";

export interface User {
  username: string;
  role: Role;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAdmin: boolean;
  isStaff: boolean;
  isStudent: boolean;
  isPendingStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("eduTrack_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("eduTrack_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("eduTrack_user");
  };

  const isAdmin = user?.role === "ADMIN";
  const isStaff = user?.role === "STAFF";
  const isStudent = user?.role === "STUDENT";
  // A student-role user whose username ends with "_staff" is awaiting admin approval
  const isPendingStaff = isStudent && (user?.username?.endsWith("_staff") ?? false);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isStaff, isStudent, isPendingStaff }}>
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

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!roles.includes(user.role)) {
    // We can't safely use toast inside render like this consistently,
    // but a quick redirect is the main goal. 
    // To show toast safely without React complaining about renders, we do it in a one-off useEffect.
    return <RoleRedirectFallback />;
  }

  return <>{children}</>;
}

function RoleRedirectFallback() {
  const { isStudent } = useAuth();
  
  useEffect(() => {
    toast.error("Unauthorized access");
  }, []);

  if (isStudent) {
    return <Navigate to="/profile" />;
  }
  return <Navigate to="/dashboard" />;
}
