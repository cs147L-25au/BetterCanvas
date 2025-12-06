import { useRef } from "react";

import { CalendarKitHandle } from "@howljs/calendar-kit";

import { AssignmentBottomSheet } from "@/components/calendar/AssignmentBottomSheet";
import { Calendar } from "@/components/calendar/Calendar";
import { OutdatedAssignmentsIndicator } from "@/components/calendar/OutdatedAssignmentsIndicator";
import { Screen } from "@/components/Screen";
import { useAssignments } from "@/hooks/useAssignments";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useAssignmentSelection } from "@/hooks/useSelectedAssignment";

export default function CalendarScreen() {
  const calendarRef = useRef<CalendarKitHandle | null>(null);

  const { assignments, loading, error } = useAssignments();
  const { events, addEvent, removeEvent } = useCalendarEvents(assignments);
  const {
    selectedAssgn,
    selectedAssgnEvent,
    selectAssignment,
    clearSelection,
  } = useAssignmentSelection(calendarRef, addEvent, removeEvent);

  return (
    <Screen>
      <Calendar
        ref={calendarRef}
        events={events}
        selectedEvent={selectedAssgnEvent}
      />
      <OutdatedAssignmentsIndicator loading={loading} error={error} />
      {/* TODO(Kelly): should only render upcoming or past overdue assignments */}
      <AssignmentBottomSheet
        assignments={assignments}
        selectedAssgn={selectedAssgn}
        onPressAssignment={selectAssignment}
        onPressBack={clearSelection}
      />
    </Screen>
  );
}
