import { type EventItem } from "@howljs/calendar-kit";

import { lightToDarkColorMap } from "@/assets/Themes/colors";

import { type Assignment } from "./supabaseQueries";

// default time block duration in minutes (used when assignment has no estimated duration)
const TIME_BLOCK_MIN_DUR = 45;
const MS_PER_MIN = 60 * 1000;

// prefix for time block event IDs to distinguish from due date events
export const TIME_BLOCK_PREFIX = "timeblock-";

// this function creates a calendar event for an assignment time block
export function createAssgnEvent(assignment: Assignment): EventItem {
  // TODO(Kelly): allow user to set preferred working hours & respect them here
  // TODO(Kelly): find next free block on calendar large enough for assignment
  const now = Date.now();

  // use estimated duration if available and valid, otherwise fall back to default
  const duration =
    Boolean(assignment.estimatedDuration) && assignment.estimatedDuration > 15
      ? assignment.estimatedDuration
      : TIME_BLOCK_MIN_DUR;

  return {
    id: `${TIME_BLOCK_PREFIX}${assignment.id}`,
    start: {
      dateTime: new Date(now).toISOString(),
    },
    end: {
      dateTime: new Date(now + duration * MS_PER_MIN).toISOString(),
    },
    title: assignment.assignmentName,
    color: assignment.course.courseColor,
    titleColor: lightToDarkColorMap[assignment.course.courseColor],
  };
}

// this function creates calendar events for each assignment's due date
// uses all-day event format so they appear in the calendar header
export function createDueDateEvents(assignments: Assignment[]): EventItem[] {
  return assignments.map((assignment) => {
    // extract just the date portion (YYYY-MM-DD) for all-day events
    const dueDate = new Date(assignment.dueDate);
    const dateString = dueDate.toISOString().split("T")[0];

    return {
      id: assignment.id,
      start: {
        date: dateString,
      },
      end: {
        date: dateString,
      },
      title: assignment.assignmentName,
      color: assignment.course.courseColor,
      titleColor: lightToDarkColorMap[assignment.course.courseColor],
    };
  });
}
