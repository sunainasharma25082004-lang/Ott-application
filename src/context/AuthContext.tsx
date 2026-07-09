import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  apiClient,
  setAuthToken,
  clearAuthToken,
  fetchMe,
  logoutUser,
  getAuthToken,
  setSelectedProfileStorage,
  getSelectedProfileStorage,
  clearSelectedProfileStorage,
} from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface Profile {
  id: string;
  name: string;
  image: string;
  isKids?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedProfile: Profile | null;
  signIn: (accessToken: string, userData?: User | null) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  selectProfile: (profile: Profile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Called after successful login / OTP verify in the login screen
  const signIn = async (accessToken: string, userData?: User | null) => {
    await setAuthToken(accessToken);
    if (userData) {
      setUser(userData);
    }
    setIsAuthenticated(true);

    // If we don't have full user data, try to fetch it
    if (!userData) {
      try {
        const meRes: any = await fetchMe();
        if (meRes?.user) {
          setUser(meRes.user);
        }
      } catch (e) {
        // non-fatal
        console.log('[Auth] signIn: could not fetch /me after token set');
      }
    }
  };

  const signOut = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setSelectedProfile(null);
      await clearSelectedProfileStorage().catch(() => {});
      setIsAuthenticated(false);
    }
  };

  const selectProfile = (profile: Profile | null) => {
    setSelectedProfile(profile);
    setSelectedProfileStorage(profile).catch(() => {});
  };

  // Check if we have a stored token and validate it (lightweight /me call)
  const refreshAuth = async (): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setSelectedProfile(null);
        await clearSelectedProfileStorage().catch(() => {});
        return false;
      }

      // Validate token by hitting protected endpoint
      const meRes: any = await fetchMe();
      if (meRes?.user) {
        setUser(meRes.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err: any) {
      // Token invalid or network issue while checking -> treat as logged out for safety
      await clearAuthToken();
      setUser(null);
      setSelectedProfile(null);
      await clearSelectedProfileStorage().catch(() => {});
      setIsAuthenticated(false);
      return false;
    }
  };

  // On app mount: try to restore session
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      setIsLoading(true);
      try {
        await refreshAuth();
        const savedProfile = await getSelectedProfileStorage();
        if (savedProfile && mounted) {
          setSelectedProfile(savedProfile);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    selectedProfile,
    signIn,
    signOut,
    refreshAuth,
    setUser,
    selectProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;