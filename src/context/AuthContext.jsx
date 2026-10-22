import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAsyncError } from "react-router";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Store the currently signed-in user.
  const [user, setUser] = useState(null);

  // Track whether we've checked the saved session.
  const [isLoading, setIsLoading] = useState(true);

  // Keep our shared user state synchronised with Supabase.
  useEffect(() => {
    // Listen for sign-in, sign-out, and session changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Check whether a session already exists when the app starts.
    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Could not load login session:", error.message);
      }

      setUser(data.session?.user ?? null);
      setIsLoading(false);
    }

    loadSession();

    // Stop listening when the provider is removed.
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
