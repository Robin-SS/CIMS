import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../supabaseClient';

// 1. Unified UserProfile tracking both naming models for safety alignment
interface UserProfile {
  id: number; 
  user_id: number; // Supported for CRUD transaction tracking queries
  username: string;
  display_name: string;
  role: 'admin' | 'employee';
}

// 2. Return type includes user info
interface AuthContextType {
  user: UserProfile | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkActiveSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const virtualEmail = session.user.email || '';
          const currentUsername = virtualEmail.split('@')[0];

          // 3. Select 'id' row fields explicitly from DB
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, display_name, role') 
            .eq('username', currentUsername)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              user_id: Number(profile.id), // Set state value cleanly for CRUD requirements
              username: profile.username,
              display_name: profile.display_name,
              role: profile.role as 'admin' | 'employee',
            });
          }
        }
      } catch (error) {
        console.error("Session restoration error:", error);
      } finally {
        setLoading(false);
      }
    }
    checkActiveSession();
  }, []);

  const login = async (username: string, inputPassword: string) => {
    try {
      const virtualEmail = `${username.trim().toLowerCase()}@cafe.local`;

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: virtualEmail,
        password: inputPassword,
      });

      if (authError) {
        return { success: false, error: 'Invalid Credentials' };
      }

      // 4. Query profile records including identity columns
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, display_name, role')
        .eq('username', username)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'User configuration profile missing' };
      }

      const loggedInUser: UserProfile = {
        id: profile.id,
        user_id: Number(profile.id), // Supported simultaneously
        username: profile.username,
        display_name: profile.display_name,
        role: profile.role as 'admin' | 'employee'
      };

      setUser(loggedInUser);
      
      // 5. Return the loggedInUser context payload bundle
      return { success: true, user: loggedInUser }; 

    } catch (err) {
      return { success: false, error: 'An unexpected database connection error occurred' };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout failed:', error.message);
      }
    } catch (error) {
      console.error('Error logging out from Supabase server:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}