import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

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

  const buildUser = async (supabaseUser: User): Promise<AuthUser> => {
    // Fetch role and profile in parallel
    const [roleResult, profileResult] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', supabaseUser.id).single(),
      supabase.from('profiles').select('full_name').eq('id', supabaseUser.id).single(),
    ]);
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: profileResult.data?.full_name ?? supabaseUser.email!,
      role: roleResult.data?.role ?? null,
    };
  };

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        setIsLoading(true); // keep loading until role is fetched
        const authUser = await buildUser(session.user);
        setUser(authUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
      }
      // If session exists, onAuthStateChange will fire and handle it
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; role: AppRole | null }> => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { success: false, role: null };
    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id).single();
    return { success: true, role: roleData?.role ?? null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut({ scope: 'local' });
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
