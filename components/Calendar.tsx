import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
} from "@howljs/calendar-kit";

export function Calendar() {
  return (
    <CalendarContainer>
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
}
