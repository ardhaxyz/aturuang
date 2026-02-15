import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isSuperadmin: boolean;
  isOrgAdmin: boolean;
  isAdmin: boolean;
  canManageRooms: boolean;
  canManageUsers: boolean;
  canManageOrganizations: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    // Verify token validity
    if (storedToken) {
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        // Token invalid, clear storage
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(username, password);
      if (response.success && response.data) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Role checks
  const isSuperadmin = user?.role === 'superadmin';
  const isOrgAdmin = user?.role === 'org_admin';
  const isAdmin = isSuperadmin || isOrgAdmin;
  const canManageRooms = isSuperadmin || isOrgAdmin;
  const canManageUsers = isSuperadmin || isOrgAdmin;
  const canManageOrganizations = isSuperadmin;

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      logout, 
      isSuperadmin,
      isOrgAdmin,
      isAdmin,
      canManageRooms,
      canManageUsers,
      canManageOrganizations
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
