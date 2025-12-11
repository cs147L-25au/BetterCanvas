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
    // Get user's enrolled courses using fetchUserCourses
    const userCourses = await fetchUserCourses();
    const courseIds = userCourses.map((course) => course.id);

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

// Fetches only the user's enrolled courses
export async function fetchUserCourses(): Promise<Course[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get user's enrolled courses with full course details
    const { data, error } = await supabase
      .from("user_courses")
      .select(
        `course_id, courses(id, course_name, course_number, course_color)`,
      )
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    // Extract and flatten the course data
    const courses = (data || [])
      .map((uc: { courses: Course | null }) => uc.courses)
      .filter(Boolean) as Course[];

    return courses;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch user courses");
  }
}

// Creates a new assignment
export async function createAssignment(assignment: {
  assignmentName: string;
  courseId: string;
  dueDate: Date;
  estimatedDuration: number;
}): Promise<Assignment> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Insert the assignment
    const { data, error } = await supabase
      .from("assignments")
      .insert({
        assignment_name: assignment.assignmentName,
        course_id: assignment.courseId,
        due_date: assignment.dueDate.toISOString(),
        estimated_duration: assignment.estimatedDuration,
      })
      .select(
        `
        id,
        assignment_name,
        due_date,
        estimated_duration,
        course:courses(course_name, course_color)
      `,
      )
      .single();

    if (error) {
      throw error;
    }

    // Map to Assignment type
    return {
      id: data.id,
      assignmentName: data.assignment_name,
      dueDate: data.due_date,
      estimatedDuration: data.estimated_duration,
      course: {
        courseName: data.course?.course_name || "Unknown Course",
        courseColor: data.course?.course_color || colors.accentColor,
      },
    };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to create assignment");
  }
}
