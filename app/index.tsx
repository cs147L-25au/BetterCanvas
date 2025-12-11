import { LoadingSpinner } from "@/components/LoadingSpinner";

/**
 * Root index route - shows loading while _layout.tsx handles authentication
 * and navigation
 */
export default function Index() {
  return <LoadingSpinner size="large" style={{ marginTop: 50 }} />;
}
