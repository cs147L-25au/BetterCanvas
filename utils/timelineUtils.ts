import type { Assignment } from "./supabaseQueries";

export interface TimelineItem {
  type: "date";
  label: string;
  assignments: Assignment[];
  dateKey: string;
}

// Creates a timeline from assignments
export function createTimeline(assignments: Assignment[]): TimelineItem[] {
  if (assignments.length === 0) return [];

  const sorted = [...assignments].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  // Group assignments by date
  const assignmentsByDate: Record<string, Assignment[]> = {};
  for (const assignment of sorted) {
    const dateKey = new Date(assignment.due_date).toDateString();
    if (!assignmentsByDate[dateKey]) {
      assignmentsByDate[dateKey] = [];
    }
    assignmentsByDate[dateKey].push(assignment);
  }

  const timeline: TimelineItem[] = [];

  // Create timeline items only for dates with assignments
  for (const [dateKey, assignments] of Object.entries(assignmentsByDate)) {
    const date = new Date(dateKey);
    let label = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    timeline.push({
      type: "date",
      label,
      assignments,
      dateKey,
    });
  }

  return timeline;
}

// Finds the index to scroll to
export function findTodayIndex(timeline: TimelineItem[]): number {
  if (timeline.length === 0) return -1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toDateString();
  const todayIndex = timeline.findIndex((item) => item.dateKey === todayKey);
  if (todayIndex !== -1) return todayIndex;

  // Find the first assignment due today or later
  const upcomingIndex = timeline.findIndex((item) => {
    const itemDate = new Date(item.dateKey);
    return itemDate >= today;
  });

  // Return upcoming index if found, otherwise return 0 (start of list)
  return upcomingIndex !== -1 ? upcomingIndex : 0;
}
