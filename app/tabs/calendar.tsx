import { useRef } from "react";

import {
  CalendarKitHandle,
  OnEventResponse,
  SelectedEventType,
} from "@howljs/calendar-kit";

import { AssignmentBottomSheet } from "@/components/calendar/AssignmentBottomSheet";
import { Calendar } from "@/components/calendar/Calendar";
import { OutdatedAssignmentsIndicator } from "@/components/calendar/OutdatedAssignmentsIndicator";
import { Screen } from "@/components/Screen";
import { useAssignments } from "@/hooks/useAssignments";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useAssignmentSelection } from "@/hooks/useSelectedAssignment";
import { TIME_BLOCK_PREFIX } from "@/utils/calendarUtils";

export default function CalendarScreen() {
  const calendarRef = useRef<CalendarKitHandle | null>(null);

  const { assignments, loading, error } = useAssignments();
  const { events, addEvent, removeEvent, updateEvent } =
    useCalendarEvents(assignments);
  const {
    selectedAssgn,
    selectedAssgnEvent,
    selectAssignment,
    selectExistingEvent,
    clearSelection,
    markAsDragged,
    updateSelectedEvent,
  } = useAssignmentSelection(calendarRef, addEvent, removeEvent);

  const today = new Date();

  // get set of assignment IDs that have time blocks on the calendar
  const timeBlockedAssignmentIds = new Set(
    events
      .filter((e) => e.id.startsWith(TIME_BLOCK_PREFIX))
      .map((e) => e.id.replace(TIME_BLOCK_PREFIX, "")),
  );

  // filter assignments: upcoming and not already time-blocked
  const upcomingAssignments = assignments.filter((assgn) => {
    const dueDate = new Date(assgn.dueDate);
    const isUpcoming = dueDate >= today;
    const isTimeBlocked = timeBlockedAssignmentIds.has(assgn.id);
    return isUpcoming && !isTimeBlocked;
  });

  function handleDragStart(_event: SelectedEventType) {
    // mark that the user has started dragging
    markAsDragged();
  }

  function handleDragEnd(event: SelectedEventType) {
    const eventId = event.id;
    const startTime = event.start?.dateTime;
    const endTime = event.end?.dateTime;

    if (!eventId || !startTime || !endTime) {
      return;
    }

    // update the event in the events array with new times
    const updatedEvent = updateEvent(eventId, startTime, endTime);

    // update the selected event so the calendar reflects the new position
    if (updatedEvent) {
      updateSelectedEvent(updatedEvent);
    }
  }

  function handleLongPressEvent(event: OnEventResponse) {
    // find the full event from our events array
    const existingEvent = events.find((e) => e.id === event.id);
    if (existingEvent) {
      selectExistingEvent(existingEvent);
    }
  }

  function handlePressBackground() {
    // clear any selected event when clicking on the calendar background
    clearSelection();
  }

  return (
    <Screen>
      <Calendar
        ref={calendarRef}
        events={events}
        selectedEvent={selectedAssgnEvent}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        handleLongPressEvent={handleLongPressEvent}
        handlePressBackground={handlePressBackground}
      />
      <OutdatedAssignmentsIndicator loading={loading} error={error} />
      {/* TODO(Kelly): should only render upcoming or past overdue assignments */}
      <AssignmentBottomSheet
        assignments={upcomingAssignments}
        selectedAssgn={selectedAssgn}
        onPressAssignment={selectAssignment}
        onPressBack={clearSelection}
      />
    </Screen>
  );
}
