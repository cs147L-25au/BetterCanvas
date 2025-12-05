import type { Assignment } from "./supabaseQueries";

export interface TimelineItem {
  type: "date";
  label: string;
  assignments: Assignment[];
  dateKey: string;
}

// Sorts assignments by due date in ascending order
function sortByDate(assignments: Assignment[]): Assignment[] {
  return [...assignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );
}

// Groups assignments by their date
function groupByDate(assignments: Assignment[]): Record<string, Assignment[]> {
  const assignmentsByDate: Record<string, Assignment[]> = {};

  for (const assignment of assignments) {
    const dateKey = new Date(assignment.dueDate).toDateString();
    if (!assignmentsByDate[dateKey]) {
      assignmentsByDate[dateKey] = [];
    }
    assignmentsByDate[dateKey].push(assignment);
  }

  return assignmentsByDate;
}

// Creates a timeline from assignments, showing only dates with assignments
export function createTimeline(assignments: Assignment[]): TimelineItem[] {
  // No-op if no assignments, return empty array
  if (assignments.length === 0) {
    return [];
  }

  const assgnsSortedByDate = sortByDate(assignments);
  const assgnsGroupedByDate = groupByDate(assgnsSortedByDate);

  const timeline: TimelineItem[] = [];

  // Build timeline items for dates with assignments
  for (const [dateKey, assignments] of Object.entries(assgnsGroupedByDate)) {
    const date = new Date(dateKey);
    const label = date.toLocaleDateString("en-US", {
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
export function findNearestAssgnIdx(timeline: TimelineItem[]): number {
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
