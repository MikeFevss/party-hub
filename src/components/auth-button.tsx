"use client";

import { useEffect, useState } from "react";
import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { LogIn, LogOut } from "lucide-react";

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, key);
  }

  return supabaseClient;
}

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const client = getSupabase();

    if (!client) {
      setLoading(false);
      setMessage(
        "Google sign-in is not configured. Check your Supabase environment variables."
      );
      return;
    }

    let mounted = true;

    async function checkSession(supabase: SupabaseClient) {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          setMessage("Unable to check your sign-in status.");
        }

        setUser(data.session?.user ?? null);
      } catch {
        if (mounted) {
          setMessage("Unable to check your sign-in status.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void checkSession(client);

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn() {
    setMessage("");

    const client = getSupabase();

    if (!client) {
      setMessage(
        "Google sign-in requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your environment variables."
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
      }
    } catch {
      setMessage("Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const client = getSupabase();

    if (!client) return;

    setLoading(true);
    setMessage("");

    try {
      const { error } = await client.auth.signOut();

      if (error) {
        setMessage(error.message);
      }
    } catch {
      setMessage("Unable to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      {user ? (
        <button
          type="button"
          className="auth-button"
          onClick={handleSignOut}
          disabled={loading}
          title={user.email ?? "Signed in"}
        >
          <LogOut size={18} aria-hidden="true" />
          <span>{loading ? "Please wait..." : "Sign out"}</span>
        </button>
      ) : (
        <button
          type="button"
          className="auth-button"
          onClick={handleSignIn}
          disabled={loading}
        >
          <LogIn size={18} aria-hidden="true" />
          <span>{loading ? "Loading..." : "Sign in with Google"}</span>
        </button>
      )}

      {message && (
        <p className="auth-message" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}