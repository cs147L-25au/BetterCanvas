import { useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";
import { Stack, useRouter, useSegments } from "expo-router";

import { supabase } from "@/lib/supabase";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === "login";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/tabs");
    }
  }, [user, segments, loading, router]);

  if (loading) {
    return null; // Or a loading screen
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
