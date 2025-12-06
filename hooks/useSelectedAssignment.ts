import { useState, type RefObject } from "react";

import { type CalendarKitHandle, type EventItem } from "@howljs/calendar-kit";

import { createAssgnEvent } from "@/utils/calendarUtils";
import { type Assignment } from "@/utils/supabaseQueries";

/**
 * Manages selected assignment state and selection events
 */
export function useAssignmentSelection(
  calendarRef: RefObject<CalendarKitHandle | null>,
  addEvent: (event: EventItem) => void,
  removeEvent: (eventId: string) => void,
) {
  const [selectedAssgn, setSelectedAssgn] = useState<Assignment | undefined>();
  const [selectedAssgnEvent, setSelectedAssgnEvent] = useState<
    EventItem | undefined
  >();

  function selectAssignment(assignment: Assignment) {
    const event = createAssgnEvent(assignment);

    // TODO(Kelly): currently the scroll falls back to "now"; however, when we
    //              implement the logic to scroll to the next free block, we
    //              can reuse that logic here as the fallback.
    // TODO(Kelly): only scroll if assignment is out of view

    // scrolls to when assignment is time blocked
    calendarRef.current?.goToDate({
      date: new Date(event.start.dateTime ?? Date.now()).toISOString(),
      hourScroll: true,
    });

    // renders assignment details in bottom sheet
    setSelectedAssgn(assignment);
    // renders assignment event on calendar
    addEvent(event);
    // selects assignment event on calendar for dragging
    setSelectedAssgnEvent(event);
  }

  function clearSelection() {
    // TODO(Kelly): conditionally remove assignment event from calendar e.g. if
    //              user attempted to drag it, we'll save it on the calendar as
    //              as a true time block event and only unselect

    // removes assignment event from calendar
    if (selectedAssgn) {
      removeEvent(selectedAssgn.id);
      setSelectedAssgnEvent(undefined);
    }

    // clears assignment details from bottom sheet
    setSelectedAssgn(undefined);
  }

  return {
    selectedAssgn,
    selectedAssgnEvent,
    selectAssignment,
    clearSelection,
  };
}
