import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { signUp } from '@/services/auth';
import { auth } from '@/services/firebase';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  profile: UserProfile | null;
  initializing: boolean;
  registerAccount: (name: string, email: string, password: string) => Promise<void>;
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
  const registering = useRef(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (registering.current) {
        return;
      }
      setProfile(toProfile(user));
      setInitializing(false);
      if (user && !user.displayName) {
        user
          .reload()
          .then(() => {
            if (auth.currentUser?.uid === user.uid) {
              setProfile(toProfile(auth.currentUser));
            }
          })
          .catch(() => undefined);
      }
    });
  }, []);

  const registerAccount = useCallback(async (name: string, email: string, password: string) => {
    registering.current = true;
    try {
      await signUp(name, email, password);
    } finally {
      registering.current = false;
      setProfile(toProfile(auth.currentUser));
    }
  }, []);

  const value = useMemo(
    () => ({ profile, initializing, registerAccount }),
    [profile, initializing, registerAccount],
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
