import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthService } from '@/services/AuthService';
import { useNavigate } from 'react-router-dom';

type UserRole = 'admin' | 'employee' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  userId: string | null;
  userName: string | null;
  loading: boolean;
  login: (role: UserRole, id: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const login = (role: UserRole, id: string, name: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
    setUserName(name);

    const painel = role === 'admin' ? 'admin' : 'funcionario';
    navigate(`/${painel}`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setUserName(null);
    AuthService.clearToken();
  };

  useEffect(() => {
    const init = async () => {
      try {
        const user = await AuthService.validateToken();
        if (user) {
          login(user.role, String(user.id), user.name);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userId,
        userName,
        loading,
        login,
        logout
      }}
    >
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