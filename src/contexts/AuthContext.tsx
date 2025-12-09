import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthService } from '@/services/AuthService';

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

  // Estados do contexto
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Função login
  const login = (role: UserRole, id: string, name: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
    setUserName(name);
  };

  // Função logout
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setUserName(null);
    AuthService.clearToken();
  };

  // *** AQUI ENTRA O useEffect ***
  useEffect(() => {
    const init = async () => {
      const user = await AuthService.validateToken();

      if (user) {
        login(user.role, user.id, user.name);
      }
    };

    console.log("passou aqui");

    init();
  }, []); // roda só quando o app inicia

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
