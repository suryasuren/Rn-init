// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getAccessToken, getRefreshToken, setTokens as tokenServiceSetTokens, clearTokens as tokenServiceClearTokens } from '../services/tokenService';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  signIn: (accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshState: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mountedRef = useRef(true);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // safe setState guard
  const safeSet = <T,>(setter: (v: T) => void, value: T) => {
    if (mountedRef.current) setter(value);
  };

  // load tokens once on mount
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const a = await getAccessToken();
        const r = await getRefreshToken();
        if (cancelled) return;
        safeSet(setAccessToken, a);
        safeSet(setRefreshToken, r);
        safeSet(setStatus, a ? 'authenticated' : 'unauthenticated');
      } catch (err) {
        // if something goes wrong, mark unauthenticated
        safeSet(setAccessToken, null);
        safeSet(setRefreshToken, null);
        safeSet(setStatus, 'unauthenticated');
      }
    })();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []);

  // public API
  const signIn = async (aToken: string, rToken: string) => {
    // store tokens securely then update in-memory state
    await tokenServiceSetTokens(aToken, rToken);
    safeSet(setAccessToken, aToken);
    safeSet(setRefreshToken, rToken);
    safeSet(setStatus, 'authenticated');
  };

  const signOut = async () => {
    // clear token storage then update state
    await tokenServiceClearTokens();
    safeSet(setAccessToken, null);
    safeSet(setRefreshToken, null);
    safeSet(setStatus, 'unauthenticated');
  };

  const refreshState = async () => {
    // re-read tokens (useful if some other module changes tokens)
    try {
      const a = await getAccessToken();
      const r = await getRefreshToken();
      safeSet(setAccessToken, a);
      safeSet(setRefreshToken, r);
      safeSet(setStatus, a ? 'authenticated' : 'unauthenticated');
    } catch (err) {
      safeSet(setAccessToken, null);
      safeSet(setRefreshToken, null);
      safeSet(setStatus, 'unauthenticated');
    }
  };

  const value: AuthContextValue = {
    status,
    accessToken,
    refreshToken,
    signIn,
    signOut,
    refreshState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
