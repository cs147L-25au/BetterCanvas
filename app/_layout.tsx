import { useCallback, useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";
import { Stack, useRouter, useSegments } from "expo-router";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/lib/supabase";

/**
 * Manages authentication state and navigation routing for the entire app.
 * Handles:
 * - Initial session check on app load
 * - Auth state changes (login/logout)
 * - Redirecting unauthenticated users to login
 * - Redirecting authenticated users without course selections to course selection screen
 */
export default function RootLayout() {
  // Current authenticated user (null if not logged in)
  const [user, setUser] = useState<User | null>(null);
  // Loading indicator while checking initial session
  const [loading, setLoading] = useState(true);
  // Flag to track if we've already checked if user has selected courses
  const [checkedCourses, setCheckedCourses] = useState(false);
  const router = useRouter();
  const segments = useSegments(); // Current route segments (e.g., ["login"], ["tabs", "courses"])

  useEffect(() => {
    // Check initial session when app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCheckedCourses(false);
    });

    // Cleanup: Unsubscribe when component unmounts
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Checks if the authenticated user has selected any courses
   * If no courses found, redirects to course selection screen
   */
  const checkUserCourses = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const { data } = await supabase
        .from("user_courses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (!data || data.length === 0) {
        router.replace("/courseSelection");
      }

      setCheckedCourses(true);
    } catch (error) {
      console.error("Error checking user courses:", error);
      setCheckedCourses(true);
    }
  }, [user, router]);

  useEffect(() => {
    if (loading) {
      return;
    }

    // Check if user is on a public route (login or course selection)
    const inAuthGroup =
      segments[0] === "login" || segments[0] === "courseSelection";

    // Redirect to login if not authenticated and not already on a public route
    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && !inAuthGroup && !checkedCourses) {
      // If authenticated and not on public route, check if user has selected courses
      checkUserCourses();
    }
  }, [user, segments, loading, checkedCourses, router, checkUserCourses]);

  if (loading) {
    return <LoadingSpinner size="large" style={{ marginTop: 50 }} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
