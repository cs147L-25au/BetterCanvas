import { useEffect } from "react";

import { useRouter } from "expo-router";

import { LoadingSpinner } from "@/components/LoadingSpinner";

/**
 * Root index route - auth logic in _layout.tsx will handle redirects
 */
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Small delay to let _layout.tsx auth check complete
    const timeout = setTimeout(() => {
      router.replace("/tabs");
    }, 100);

    return () => clearTimeout(timeout);
  }, [router]);

  return <LoadingSpinner size="large" style={{ marginTop: 50 }} />;
}
