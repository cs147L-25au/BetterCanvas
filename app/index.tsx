import { Redirect } from "expo-router";

/**
 * Root index route that serves as the app's entry point.
 * Redirects to /tabs, where the auth logic in _layout.tsx will:
 * - If user is not logged in: redirect to /login
 * - If user is logged in: show the app
 */
export default function Index() {
  return <Redirect href="/tabs" />;
}
