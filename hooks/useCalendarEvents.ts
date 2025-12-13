import { useEffect, useState } from "react";

import { type EventItem } from "@howljs/calendar-kit";

import { createDueDateEvents } from "@/utils/calendarUtils";
import { type Assignment } from "@/utils/supabaseQueries";

/**
 * Manages calendar events state
 */
export function useCalendarEvents(assignments: Assignment[]) {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    setEvents(createDueDateEvents(assignments));
  }, [assignments]);

  // renders event on calendar
  const addEvent = (event: EventItem) => {
    setEvents((prev) => [...prev, event]);
  };

  // removes event from calendar
  const removeEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  // updates an existing event's times
  const updateEvent = (
    eventId: string,
    start: string,
    end: string,
  ): EventItem | undefined => {
    let updatedEvent: EventItem | undefined;
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === eventId) {
          updatedEvent = {
            ...event,
            start: { dateTime: start },
            end: { dateTime: end },
          };
          return updatedEvent;
        }
        return event;
      }),
    );
    return updatedEvent;
  };

  return { events, addEvent, removeEvent, updateEvent };
}
