import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  EventItem,
} from "@howljs/calendar-kit";

type CalendarProps = {
  events: EventItem[];
};

export function Calendar({ events }: CalendarProps) {
  return (
    <CalendarContainer events={events}>
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
}
