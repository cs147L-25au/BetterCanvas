import { type EventItem } from "@howljs/calendar-kit";

import { lightToDarkColorMap } from "@/assets/Themes/colors";

import { type Assignment } from "./supabaseQueries";

const DUE_DATE_MIN_DUR = 20;
const MS_PER_MIN = 60 * 1000;

export function createDueDateEvents(assignments: Assignment[]): EventItem[] {
  return assignments.map((assignment) => {
    const { startTime, endTime } = getDueDateTimes(assignment.dueDate);

    return {
      id: assignment.id,
      start: {
        dateTime: startTime,
      },
      end: {
        dateTime: endTime,
      },
      title: assignment.assignmentName,
      color: assignment.course.courseColor,
      titleColor: lightToDarkColorMap[assignment.course.courseColor],
    };
  });
}

// this function sets a duration for due date events so that they're visible on
// the calendar
function getDueDateTimes(dueDateString: string): {
  startTime: string;
  endTime: string;
} {
  const dueDate = new Date(dueDateString);
  const durationMs = DUE_DATE_MIN_DUR * MS_PER_MIN;

  // Check if adding duration extends the event beyond the current day
  const endDate = new Date(dueDate.getTime() + durationMs);
  const extendsToNextDay = endDate.getDate() !== dueDate.getDate();

  // If it extends to next day, expand backward; otherwise expand forward
  const startTime = extendsToNextDay
    ? new Date(dueDate.getTime() - durationMs).toISOString()
    : dueDateString;

  const endTime = extendsToNextDay
    ? dueDateString
    : new Date(dueDate.getTime() + durationMs).toISOString();

  return { startTime, endTime };
}
