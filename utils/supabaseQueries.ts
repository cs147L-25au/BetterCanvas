import { supabase } from "@/lib/supabase";

export type Assignment = {
  id: string;
  assignment_name: string;
  due_date: string;
  estimated_duration: number;
  course_name: string;
};

type SupabaseAssignmentReturn = {
  id: string;
  assignment_name: string;
  due_date: string;
  estimated_duration: number;
  course: {
    course_name: string;
  } | null;
};

export async function fetchAssignments(): Promise<Assignment[]> {
  try {
    const { data, error } = await supabase
      .from("assignments")
      .select(
        `
        id,
        assignment_name,
        due_date,
        estimated_duration,
        course:courses(course_name)
      `
      )
      .order("due_date", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    // Make data usable for Assignment type
    return (data || []).map((item: SupabaseAssignmentReturn) => ({
      id: item.id,
      assignment_name: item.assignment_name,
      due_date: item.due_date,
      estimated_duration: item.estimated_duration,
      course_name: item.course?.course_name || "Unknown Course",
    }));
  } catch (err) {
    throw new Error("Failed to fetch assignments");
  }
}
