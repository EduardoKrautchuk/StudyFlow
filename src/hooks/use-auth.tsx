import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth } from '@/services/firebase';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  profile: UserProfile | null;
  initializing: boolean;
  refreshProfile: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toProfile(user: User | null): UserProfile | null {
  if (!user) {
    return null;
  }
  return {
    uid: user.uid,
    name: user.displayName ?? '',
    email: user.email ?? '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setProfile(toProfile(user));
      setInitializing(false);
    });
  }, []);

  const refreshProfile = useCallback(() => {
    setProfile(toProfile(auth.currentUser));
  }, []);

  const value = useMemo(
    () => ({ profile, initializing, refreshProfile }),
    [profile, initializing, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
