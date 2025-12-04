import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'admin' | 'employee' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  userId: string | null;
  userName: string | null;
  login: (role: UserRole, id: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const login = (role: UserRole, id: string, name: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
    setUserName(name);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userId, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
