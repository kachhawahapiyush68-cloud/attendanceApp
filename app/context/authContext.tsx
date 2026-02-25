// context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

interface AuthContextType {
  userName: string | null;
  setUserName: (name: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUserName?: string | null;
}

export function AuthProvider({ children, initialUserName = null }: AuthProviderProps) {
  const [userName, setUserName] = useState<string | null>(initialUserName);

  const value = useMemo(
    () => ({ userName, setUserName }),
    [userName]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
