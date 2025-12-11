import { useEffect, useState } from "react";

import { fetchAssignments, type Assignment } from "@/utils/supabaseQueries";

/**
 * Fetches assignments from the database and manages assignments state
 */
export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const data = await fetchAssignments();
      setAssignments(data);
    } catch (err) {
      setError("Failed to fetch assignments: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  return { assignments, loading, error, refetch: loadAssignments };
}
