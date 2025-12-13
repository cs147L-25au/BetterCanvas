import { useEffect, useState } from "react";

import {
  fetchAssignments,
  type Assignment,
  type Course,
} from "@/utils/supabaseQueries";

/**
 * Fetches assignments from the database and derives courses from assignment data
 */
export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(undefined);

      const assignmentsData = await fetchAssignments();
      setAssignments(assignmentsData);

      // Extract unique courses from assignments
      const uniqueCourses = assignmentsData.reduce((acc, assgn) => {
        // Check if we've already added this course
        if (!acc.some((course) => course.id === assgn.course.id)) {
          acc.push(assgn.course);
        }

        return acc;
      }, [] as Course[]);

      setCourses(uniqueCourses);
    } catch (err) {
      setError("Failed to fetch assignments: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  return {
    assignments,
    courses,
    loading,
    error,
    refetch: loadAssignments,
  };
}
