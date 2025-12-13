import { colors } from "@/assets/Themes/colors";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type Course = {
  id: string;
  courseName: string;
  courseNumber: string;
  courseColor: string;
};

export type Assignment = {
  id: string;
  assignmentName: string;
  dueDate: string;
  estimatedDuration: number;
  course: Course;
  checked?: boolean;
};

type SupabaseAssignmentReturn = Omit<
  Database["public"]["Tables"]["assignments"]["Row"],
  "course_id" | "created_at"
> & {
  course: Pick<
    Database["public"]["Tables"]["courses"]["Row"],
    "id" | "course_name" | "course_number" | "course_color"
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

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Fetch assignments for user's courses: global (user_id is null) or user-specific (user_id = user.id)
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from("assignments")
      .select(
        `
        id,
        assignment_name,
        due_date,
        estimated_duration,
        course:courses(id, course_name, course_number, course_color),
        user_id
      `,
      )
      .in("course_id", courseIds)
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("due_date", { ascending: true });

    if (assignmentsError) {
      throw new Error(assignmentsError.message);
    }

    // Fetch user_assignments for checked state

    const { data: userAssignmentsData, error: userAssignmentsError } =
      await supabase
        .from("user_assignments")
        .select("assignment_id, checked")
        .eq("user_id", user.id);

    if (userAssignmentsError) {
      throw new Error(userAssignmentsError.message);
    }

    // Map assignment_id to is_checked for quick lookup
    const checkedMap: Record<string, boolean> = {};
    if (Array.isArray(userAssignmentsData)) {
      userAssignmentsData.forEach((ua) => {
        checkedMap[ua.assignment_id] = ua.checked;
      });
    }

    // Map data to Assignment type
    const result = Array.isArray(assignmentsData)
      ? (
          assignmentsData as (SupabaseAssignmentReturn & {
            user_id?: string | null;
          })[]
        ).map((item) => {
          return {
            id: item.id,
            assignmentName: item.assignment_name,
            dueDate: item.due_date,
            estimatedDuration: item.estimated_duration,
            checked: checkedMap[item.id] ?? false,
            course: {
              id: item.course?.id || "",
              courseName: item.course?.course_name || "Unknown Course",
              courseNumber: item.course?.course_number || "",
              courseColor: item.course?.course_color || colors.accentColor,
            },
          };
        })
      : [];

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

    return (data || []).map((course) => ({
      id: course.id,
      courseName: course.course_name,
      courseNumber: course.course_number,
      courseColor: course.course_color,
    }));
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
      .map(
        (uc: {
          courses: {
            id: string;
            course_name: string;
            course_number: string;
            course_color: string;
          } | null;
        }) =>
          uc.courses
            ? {
                id: uc.courses.id,
                courseName: uc.courses.course_name,
                courseNumber: uc.courses.course_number,
                courseColor: uc.courses.course_color,
              }
            : null,
      )
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

    // Insert the assignment with user_id for custom assignments
    const { data, error } = await supabase
      .from("assignments")
      .insert({
        assignment_name: assignment.assignmentName,
        course_id: assignment.courseId,
        due_date: assignment.dueDate.toISOString(),
        estimated_duration: assignment.estimatedDuration,
        user_id: user.id, // always set user_id for custom assignments
      })
      .select(
        `
        id,
        assignment_name,
        due_date,
        estimated_duration,
        course:courses(id, course_name, course_number, course_color)
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
        id: data.course?.id || "",
        courseName: data.course?.course_name || "Unknown Course",
        courseNumber: data.course?.course_number || "",
        courseColor: data.course?.course_color || colors.accentColor,
      },
    };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to create assignment");
  }
}

// Updates or inserts the checked state for a user's assignment
export async function updateUserAssignmentChecked(
  assignmentId: string,
  checked: boolean,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Upsert the checked state for this user and assignment
  const { error } = await supabase.from("user_assignments").upsert(
    [
      {
        user_id: user.id,
        assignment_id: assignmentId,
        checked,
      },
    ],
    { onConflict: "user_id,assignment_id", defaultToNull: false },
  );
  if (error) {
    throw new Error(error.message);
  }
}

// Optimistically update checked state for an assignment in a local array, update DB, and revert on error
export async function optimisticUpdateChecked(
  assignmentId: string,
  checked: boolean,
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>,
): Promise<void> {
  setAssignments((prev) =>
    prev.map((a) => (a.id === assignmentId ? { ...a, checked } : a)),
  );

  try {
    await updateUserAssignmentChecked(assignmentId, checked);
  } catch (err) {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId ? { ...a, checked: !checked } : a,
      ),
    );

    throw err;
  }
}
