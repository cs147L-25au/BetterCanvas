import type { Assignment } from "./supabaseQueries";

export interface TimelineItem {
  type: "date" | "gap";
  label: string;
  assignments?: Assignment[];
  dateKey: string;
}

// Formats a date range
export function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (start.toDateString() === end.toDateString()) {
    return `${startStr}`;
  }
  return `${startStr} - ${endStr}`;
}

// Creates a timeline from assignments, including date sections and gaps
export function createTimeline(assignments: Assignment[]): TimelineItem[] {
  if (assignments.length === 0) return [];

  const sorted = [...assignments].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  const timeline: TimelineItem[] = [];
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const startDate = new Date(new Date(sorted[0].due_date).setHours(0, 0, 0, 0));

  let firstDate;
  if (startDate < today) {
    firstDate = startDate;
  } else {
    firstDate = today;
  }

  let currentDate = new Date(firstDate);
  const finalDate = new Date(
    new Date(sorted[sorted.length - 1].due_date).setHours(0, 0, 0, 0)
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

  let gapStart: Date | null = null;
  const todayKey = today.toDateString();

  // Helper to add a date section to the timeline
  const addDateSection = (
    date: Date,
    assignments?: Assignment[],
    isToday = false
  ) => {
    let label = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    if (isToday) {
      label = "Today: " + label;
    }

    timeline.push({
      type: "date",
      label,
      assignments,
      dateKey: date.toDateString(),
    });
  };

  // Closes gaps between assignments and add to timeline
  const closeGap = (endDate: Date) => {
    if (gapStart) {
      timeline.push({
        type: "gap",
        label: formatDateRange(gapStart, endDate),
        dateKey: `gap-${gapStart.getTime()}`,
      });
      gapStart = null;
    }
  };

  while (currentDate <= finalDate) {
    const dateKey = currentDate.toDateString();
    const hasAssignments = assignmentsByDate[dateKey];
    const isToday = dateKey === todayKey;

    if (hasAssignments || isToday) {
      const gapEnd = new Date(currentDate);
      gapEnd.setDate(gapEnd.getDate() - 1);
      closeGap(gapEnd);
      addDateSection(currentDate, hasAssignments, isToday);
      gapStart = null;
    } else if (!gapStart) {
      gapStart = new Date(currentDate);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Close any remaining gap
  if (gapStart) {
    const gapEnd = new Date(currentDate);
    gapEnd.setDate(gapEnd.getDate() - 1);
    timeline.push({
      type: "gap",
      label: formatDateRange(gapStart, gapEnd),
      dateKey: `gap-${gapStart.getTime()}`,
    });
  }

  return timeline;
}

// Finds the index of today's date in the timeline
export function findTodayIndex(timeline: TimelineItem[]): number {
  const todayKey = new Date().toDateString();
  return timeline.findIndex((item) => item.dateKey === todayKey);
}
