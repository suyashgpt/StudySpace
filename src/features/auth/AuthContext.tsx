import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isDemoSession: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoSession, setIsDemoSession] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      // In unconfigured demo mode, check if temporary demo session was set
      const demoUserStored = localStorage.getItem('studyspace_demo_user');
      if (demoUserStored && isMounted) {
        setUser({ id: 'demo-admin-id', email: demoUserStored } as User);
        setIsDemoSession(true);
      }
      setIsLoading(false);
      return;
    }

    // Live Supabase Auth session detection
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      // Unconfigured demonstration mode login
      if (email && pass.length >= 6) {
        const demoUser = { id: 'demo-admin-id', email } as User;
        setUser(demoUser);
        setIsDemoSession(true);
        localStorage.setItem('studyspace_demo_user', email);
        return { success: true };
      }
      return { success: false, error: 'Password must be at least 6 characters in demo mode.' };
    }

    // Authenticate through real Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    setSession(data.session);
    setUser(data.user);
    return { success: true };
  };

  const logout = async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setIsDemoSession(false);
      localStorage.removeItem('studyspace_demo_user');
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isDemoSession, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
