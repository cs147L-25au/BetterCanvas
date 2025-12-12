import { useEffect, useState } from "react";

import {
  fetchAssignments,
  fetchUserCourses,
  type Assignment,
  type Course,
} from "@/utils/supabaseQueries";

/**
 * Fetches assignments and user's courses from the database and manages state
 */
export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const loadAssignmentsAndCourses = async () => {
    try {
      setLoading(true);
      setError(undefined);
      // Fetch both in parallel for speed
      const [assignmentsData, coursesData] = await Promise.all([
        fetchAssignments(),
        fetchUserCourses(),
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (err) {
      setError("Failed to fetch assignments or courses: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignmentsAndCourses();
  }, []);

  return {
    assignments,
    courses,
    loading,
    error,
    refetch: loadAssignmentsAndCourses,
  };
}
