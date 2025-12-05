import { supabase } from "@/lib/supabase";
import { colors } from "@/assets/Themes/colors";
import type { Database } from "@/types/database";

export type Assignment = {
  id: string;
  assignment_name: string;
  due_date: string;
  estimated_duration: number;
  course: {
    course_name: string;
    course_color: string;
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
//   } | null;
// };

type SupabaseAssignmentReturn =
  Database["public"]["Tables"]["assignments"]["Row"] & {
    course: Pick<
      Database["public"]["Tables"]["courses"]["Row"],
      "course_name"
    > | null;
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

    // Assign colors to courses
    const courseColorMap = new Map<string, string>();
    let colorIndex = 0;
    (data || []).forEach((item: SupabaseAssignmentReturn) => {
      const courseName = item.course?.course_name || "Unknown Course";
      if (!courseColorMap.has(courseName)) {
        const assignedColor =
          colors.classColors[colorIndex % colors.classColors.length];
        courseColorMap.set(courseName, assignedColor);
        colorIndex++;
      }
    });

    // Make data usable for Assignment type
    const result = (data || []).map((item: SupabaseAssignmentReturn) => {
      const courseName = item.course?.course_name || "Unknown Course";
      const courseColor = courseColorMap.get(courseName);
      if (!courseColor) {
        throw new Error(`No color assigned for course: ${courseName}`);
      }

      return {
        id: item.id,
        assignment_name: item.assignment_name,
        due_date: item.due_date,
        estimated_duration: item.estimated_duration,
        course: {
          course_name: courseName,
          course_color: courseColor,
        },
      };
    });

    return result;
  } catch (err) {
    throw new Error("Failed to fetch assignments");
  }
}
