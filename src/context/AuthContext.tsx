'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  authStatus: 'loading' | 'guest' | 'authenticated';
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'magic';
  isGuestDrawerOpen: boolean;
  attemptedAction: string | null;
  openAuthModal: (mode?: 'login' | 'signup' | 'magic') => void;
  closeAuthModal: () => void;
  openGuestDrawer: (actionName?: string) => void;
  closeGuestDrawer: () => void;
  requireAuth: (actionCallback: () => void, actionName?: string) => void;
  loginWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  loginWithMagicLink: (email: string) => Promise<{ error: any }>;
  loginWithGoogle: () => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getRedirectUrl = () => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://surihub.vercel.app';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'guest' | 'authenticated'>('loading');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'magic'>('login');
  const [isGuestDrawerOpen, setIsGuestDrawerOpen] = useState(false);
  const [attemptedAction, setAttemptedAction] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthStatus('guest');
      return;
    }

    // Fetch session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setAuthStatus(currentUser ? 'authenticated' : 'guest');
    });

    // Subscribe to auth updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setAuthStatus(currentUser ? 'authenticated' : 'guest');
      if (currentUser) {
        setIsAuthModalOpen(false);
        setIsGuestDrawerOpen(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (mode: 'login' | 'signup' | 'magic' = 'login') => {
    setAuthModalMode(mode);
    setIsGuestDrawerOpen(false);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openGuestDrawer = (actionName?: string) => {
    setAttemptedAction(actionName || null);
    setIsGuestDrawerOpen(true);
  };

  const closeGuestDrawer = () => {
    setIsGuestDrawerOpen(false);
  };

  /**
   * Intercepts write actions. If user is logged in, executes actionCallback.
   * If user is a Guest, prevents the action and opens the GuestTeaserDrawer.
   */
  const requireAuth = (actionCallback: () => void, actionName?: string) => {
    if (user) {
      actionCallback();
    } else {
      openGuestDrawer(actionName);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase belum dikonfigurasi.') };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase belum dikonfigurasi.') };
    }
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });
    return { error };
  };

  const loginWithMagicLink = async (email: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase belum dikonfigurasi.') };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });
    return { error };
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase belum dikonfigurasi.') };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl(),
      },
    });
    return { error };
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setAuthStatus('guest');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest: !user,
        authStatus,
        isAuthModalOpen,
        authModalMode,
        isGuestDrawerOpen,
        attemptedAction,
        openAuthModal,
        closeAuthModal,
        openGuestDrawer,
        closeGuestDrawer,
        requireAuth,
        loginWithEmail,
        signUpWithEmail,
        loginWithMagicLink,
        loginWithGoogle,
        logout,
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
