import { useState, type RefObject } from "react";

import { type CalendarKitHandle, type EventItem } from "@howljs/calendar-kit";

import { createAssgnEvent, TIME_BLOCK_PREFIX } from "@/utils/calendarUtils";
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
  // tracks whether user has dragged the event to a new time
  const [wasDragged, setWasDragged] = useState(false);

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
    // reset drag state for new selection
    setWasDragged(false);
  }

  function markAsDragged() {
    setWasDragged(true);
  }

  function updateSelectedEvent(event: EventItem) {
    setSelectedAssgnEvent(event);
  }

  // selects an existing event on the calendar for editing (e.g., from long press)
  function selectExistingEvent(event: EventItem) {
    setSelectedAssgnEvent(event);
    // existing events should be kept on calendar
    setWasDragged(true);
    // clear any assignment selection since we're just editing the event
    setSelectedAssgn(undefined);
  }

  function clearSelection() {
    if (selectedAssgn) {
      if (wasDragged) {
        // keep the event on calendar as a time block, just deselect it
        setSelectedAssgnEvent(undefined);
      } else {
        // user didn't drag, remove the event from calendar
        removeEvent(`${TIME_BLOCK_PREFIX}${selectedAssgn.id}`);
        setSelectedAssgnEvent(undefined);
      }
    } else if (selectedAssgnEvent) {
      // event was selected via long press (no associated assignment)
      // just deselect it, keep it on the calendar
      setSelectedAssgnEvent(undefined);
    }

    // clears assignment details from bottom sheet
    setSelectedAssgn(undefined);
    setWasDragged(false);
  }

  return {
    selectedAssgn,
    selectedAssgnEvent,
    wasDragged,
    selectAssignment,
    selectExistingEvent,
    clearSelection,
    markAsDragged,
    updateSelectedEvent,
  };
}
