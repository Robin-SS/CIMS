import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../supabaseClient';

// 1. Add `id: number` to the profile
interface UserProfile {
  id: number; 
  username: string;
  display_name: string;
  role: 'admin' | 'employee';
}

// 2. Update the return type of login to include the user
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

          // 3. Add 'id' to the select string
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, display_name, role') 
            .eq('username', currentUsername)
            .single();

          if (profile) {
            setUser({
              id: profile.id, // <-- Add id here
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

      // 4. Add 'id' to the select string here too
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, display_name, role')
        .eq('username', username)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'User configuration profile missing' };
      }

      const loggedInUser: UserProfile = {
        id: profile.id, // <-- Add id here
        username: profile.username,
        display_name: profile.display_name,
        role: profile.role as 'admin' | 'employee'
      };

      setUser(loggedInUser);
      
      // 5. Return the loggedInUser so Login.tsx can read the ID instantly
      return { success: true, user: loggedInUser }; 

    } catch (err) {
      return { success: false, error: 'An unexpected database connection error occurred' };
    }
  };

  // Securely terminate session tokens globally
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