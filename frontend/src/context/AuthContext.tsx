/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getMeApi, loginApi, registerApi } from '../api/authApi';
import type {
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token')
  );
  // Only loading if there is a token to verify on boot
  const [loading, setLoading] = useState<boolean>(() =>
    Boolean(localStorage.getItem('token'))
  );

  // Initialize auth state on application startup
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      return;
    }

    // Demo Mode bypass
    if (savedToken === 'demo-token') {
      const demoUser = JSON.parse(
        localStorage.getItem('demo_user') ||
          '{"id": 99, "email": "demo@kho.vn", "full_name": "Quản Trị Viên Demo", "created_at": "2026-11-10T00:00:00"}'
      );
      setUser(demoUser);
      setToken(savedToken);
      setLoading(false);
      return;
    }

    let isMounted = true;

    getMeApi()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
          setToken(savedToken);
        }
      })
      .catch((error) => {
        console.error('Failed to authenticate token:', error);
        if (isMounted) {
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Manual refresh user profile helper
  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getMeApi();
      setUser(currentUser);
      setToken(savedToken);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    }
  }, []);

  /**
   * Login user with username (email) and password
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const authData = await loginApi(credentials);
      const accessToken = authData.access_token;

      localStorage.setItem('token', accessToken);
      setToken(accessToken);

      const userProfile = await getMeApi();
      setUser(userProfile);
    },
    []
  );

  /**
   * Register a new user
   */
  const register = useCallback(
    async (data: RegisterCredentials): Promise<User> => {
      const newUser = await registerApi(data);
      return newUser;
    },
    []
  );

  /**
   * Login as Demo User (Xem thử không cần Backend)
   */
  const loginAsDemo = useCallback(() => {
    const demoUser: User = {
      id: 99,
      email: 'demo@kho.vn',
      full_name: 'Quản Trị Viên Demo',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    setToken('demo-token');
    setUser(demoUser);
  }, []);

  /**
   * Log out current user & purge credentials
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('demo_user');
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    loginAsDemo,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to consume the AuthContext safely
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
