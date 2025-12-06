import { useMemo } from "react";

import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  CalendarKitHandle,
  type EventItem,
} from "@howljs/calendar-kit";
import { Dimensions } from "react-native";
import { styled } from "styled-components/native";

const windowHeight = Dimensions.get("window").height;

type CalendarProps = {
  ref: React.RefObject<CalendarKitHandle | null>;
  events: EventItem[];
  selectedEvent?: EventItem;
};

export function Calendar({ ref, events, selectedEvent }: CalendarProps) {
  // TODO(Kelly): have first day be the day of the earliest overdue assignment
  //              if overdue assignment exceeds window that excludes today and
  //              tomorrow, have first day be the earliest overdue assignment
  //              that falls within the window
  //              if there are no overdue assignments, have first day be today

  // get the day from today's date e.g. if today is saturday, return saturday
  const firstDay = useMemo(() => {
    return new Date().getDay();
  }, []);

  // TODO(Kelly): if overdue assignment exceeds calendar window, show indicator
  //              on calendar that there are overdue assignments in the past

  return (
    <Container>
      <CalendarContainer
        ref={ref}
        events={events}
        scrollByDay={true}
        firstDay={firstDay}
        selectedEvent={selectedEvent}
        allowDragToEdit={true}
        allowPinchToZoom={true}
      >
        <CalendarHeader />
        <CalendarBody />
      </CalendarContainer>
    </Container>
  );
}

const Container = styled.View`
  height: ${windowHeight * 0.68}px;
`;
