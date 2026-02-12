// context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  userName: string | null;
  setUserName: (name: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ userName, setUserName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
