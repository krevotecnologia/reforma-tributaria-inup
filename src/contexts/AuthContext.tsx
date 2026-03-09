import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

type AppRole = 'admin' | 'client';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AppRole | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role: AppRole | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string, email: string): Promise<AuthUser> => {
    const [roleRes, profileRes] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
      supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
    ]);
    return {
      id: userId,
      email,
      name: profileRes.data?.full_name ?? email,
      role: (roleRes.data?.role as AppRole) ?? null,
    };
  };

  useEffect(() => {
    // First, get existing session synchronously before subscribing
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (existingSession?.user) {
        try {
          const authUser = await fetchUserData(existingSession.user.id, existingSession.user.email!);
          setUser(authUser);
          setSession(existingSession);
        } catch {
          setUser(null);
          setSession(null);
        }
      } else {
        setUser(null);
        setSession(null);
      }
      setIsLoading(false);
    });

    // Subscribe to future auth changes (sign in/out in other tabs, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // Only handle events after initial load to avoid double-processing
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setIsLoading(false);
        return;
      }
      if (event === 'TOKEN_REFRESHED' && newSession) {
        setSession(newSession);
        return;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; role: AppRole | null }> => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { success: false, role: null };

    try {
      const authUser = await fetchUserData(data.user.id, data.user.email!);
      setUser(authUser);
      setSession(data.session);
      return { success: true, role: authUser.role };
    } catch {
      return { success: false, role: null };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut({ scope: 'local' });
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
