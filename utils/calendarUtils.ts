import { type EventItem } from "@howljs/calendar-kit";

import { lightToDarkColorMap } from "@/assets/Themes/colors";

import { type Assignment } from "./supabaseQueries";

// TODO(Kelly): allow user to set time block duration (likely in the assignment
//              details screen) & respect it here
const TIME_BLOCK_MIN_DUR = 45;
const DUE_DATE_MIN_DUR = 20;
const MS_PER_MIN = 60 * 1000;

// this function creates a calendar event for an assignment time block
export function createAssgnEvent(assignment: Assignment): EventItem {
  // TODO(Kelly): allow user to set preferred working hours & respect them here
  // TODO(Kelly): find next free block on calendar large enough for assignment
  const now = Date.now();

  return {
    id: assignment.id,
    start: {
      dateTime: new Date(now).toISOString(),
    },
    end: {
      dateTime: new Date(now + TIME_BLOCK_MIN_DUR * MS_PER_MIN).toISOString(),
    },
    title: assignment.assignmentName,
    color: assignment.course.courseColor,
    titleColor: lightToDarkColorMap[assignment.course.courseColor],
  };
}

// this function creates calendar events for each assignment's due date
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
  const extendsToNextDay = endDate.toDateString() !== dueDate.toDateString();

  // If it extends to next day, expand backward; otherwise expand forward
  const startTime = extendsToNextDay
    ? new Date(dueDate.getTime() - durationMs).toISOString()
    : dueDateString;

  const endTime = extendsToNextDay
    ? dueDateString
    : new Date(dueDate.getTime() + durationMs).toISOString();

  return { startTime, endTime };
}
