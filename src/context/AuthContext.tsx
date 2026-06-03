import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../supabaseClient';

// Define what a securely authenticated user profile looks like
interface UserProfile {
  username: string;
  display_name: string;
  role: 'admin' | 'employee';
}

// Define everything our authentication system shares globally across the app
interface AuthContextType {
  user: UserProfile | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Authenticate sessions using native Supabase JWT Tokens on app boot/refresh
  useEffect(() => {
    async function checkActiveSession() {
      try {
        // 1. Ask Supabase if a valid cryptographic session cookie/token exists
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // Extract the username back out of the metadata or virtual email string
          const virtualEmail = session.user.email || '';
          const currentUsername = virtualEmail.split('@')[0];

          // 2. Fetch profile records matching that validated token user
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name, role')
            .eq('username', currentUsername)
            .single();

          if (profile) {
            setUser({
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

  // Secure token-based login handler
  const login = async (username: string, inputPassword: string) => {
    try {
      // 1. Convert custom username to a virtual corporate email format for Supabase Auth
      const virtualEmail = `${username.trim().toLowerCase()}@cafe.local`;

      // 2. Authenticate against Supabase Auth. This sets an encrypted JWT token 
      // automatically inside browser storage and secures communication.
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: virtualEmail,
        password: inputPassword,
      });

      if (authError) {
        return { success: false, error: 'Invalid username or password' };
      }

      // 3. Query profiles table to retrieve display settings and application permissions
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, display_name, role')
        .eq('username', username)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'User configuration profile missing' };
      }

      const loggedInUser: UserProfile = {
        username: profile.username,
        display_name: profile.display_name,
        role: profile.role as 'admin' | 'employee'
      };

      setUser(loggedInUser);
      return { success: true };

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