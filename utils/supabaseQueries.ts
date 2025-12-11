import { colors } from "@/assets/Themes/colors";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type Course = {
  id: string;
  course_name: string;
  course_number: string;
  course_color: string;
};

export type Assignment = {
  id: string;
  assignmentName: string;
  dueDate: string;
  estimatedDuration: number;
  course: {
    courseName: string;
    courseColor: string;
  };
};

// Return type:
// type SupabaseAssignmentReturn = {
//   id: string;
//   assignment_name: string;
//   due_date: string;
//   estimated_duration: number;
//   course: {
//     course_name: string;
//     course_color: string;
//   } | null;
// };

type SupabaseAssignmentReturn = Omit<
  Database["public"]["Tables"]["assignments"]["Row"],
  "course_id" | "created_at"
> & {
  course: Pick<
    Database["public"]["Tables"]["courses"]["Row"],
    "course_name" | "course_color"
  > | null;
};

export async function fetchAssignments(): Promise<Assignment[]> {
  try {
    // TODO hannah: if we need authentication in the future, move to helper
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get user's enrolled courses
    const { data: userCourses, error: coursesError } = await supabase
      .from("user_courses")
      .select("course_id")
      .eq("user_id", user.id);

    if (coursesError) {
      throw coursesError;
    }

    const courseIds =
      (userCourses as { course_id: string }[])?.map((uc) => uc.course_id) || [];

    if (courseIds.length === 0) {
      return []; // No courses selected yet
    }

    // Fetch assignments only for user's courses
    const { data, error } = await supabase
      .from("assignments")
      .select(
        `
        id,
        assignment_name,
        due_date,
        estimated_duration,
        course:courses(course_name, course_color)
      `,
      )
      .in("course_id", courseIds)
      .order("due_date", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    // Map data to Assignment type
    const result = (data || []).map((item: SupabaseAssignmentReturn) => {
      return {
        id: item.id,
        assignmentName: item.assignment_name,
        dueDate: item.due_date,
        estimatedDuration: item.estimated_duration,
        course: {
          courseName: item.course?.course_name || "Unknown Course",
          courseColor: item.course?.course_color || colors.accentColor,
        },
      };
    });

    return result;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch assignments");
  }
}

// Fetches all available courses
export async function fetchCourses(): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("id, course_name, course_number, course_color")
      .order("course_name");

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch courses");
  }
}
