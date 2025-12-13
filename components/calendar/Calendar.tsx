import { useCallback, useMemo } from "react";

import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  CalendarKitHandle,
  DraggableEvent,
  DraggableEventProps,
  DraggingEvent,
  DraggingEventProps,
  OnEventResponse,
  SelectedEventType,
  type EventItem,
} from "@howljs/calendar-kit";
import { Dimensions, Text } from "react-native";
import { styled } from "styled-components/native";

import { colors, lightToDarkColorMap } from "@/assets/Themes/colors";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

type CalendarProps = {
  ref: React.RefObject<CalendarKitHandle | null>;
  events: EventItem[];
  selectedEvent?: EventItem;
  handleDragStart: (event: SelectedEventType) => void;
  handleDragEnd: (event: SelectedEventType) => void;
  handleLongPressEvent: (event: OnEventResponse) => void;
  handlePressBackground: () => void;
};

export function Calendar({
  ref,
  events,
  selectedEvent,
  handleDragStart,
  handleDragEnd,
  handleLongPressEvent,
  handlePressBackground,
}: CalendarProps) {
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

  const renderEvent = useCallback(
    (event: SelectedEventType | undefined) => (
      <Text
        style={{
          color: colors.textContrast,
          fontSize: windowWidth * 0.028,
          paddingHorizontal: windowWidth * 0.005,
        }}
      >
        {event?.title}
      </Text>
    ),
    [],
  );

  const containerStyle = useMemo(
    () => ({
      backgroundColor: lightToDarkColorMap[selectedEvent?.color ?? ""],
    }),
    [selectedEvent?.color],
  );

  const renderDraggableEvent = useCallback(
    (props: DraggableEventProps) => (
      <DraggableEvent
        {...props}
        renderEvent={renderEvent}
        containerStyle={containerStyle}
      />
    ),
    [renderEvent, containerStyle],
  );

  const renderDraggingEvent = useCallback(
    (props: DraggingEventProps) => (
      <DraggingEvent
        {...props}
        renderEvent={renderEvent}
        containerStyle={containerStyle}
      />
    ),
    [renderEvent, containerStyle],
  );

  return (
    <Container>
      <CalendarContainer
        ref={ref}
        events={events}
        scrollByDay={true}
        firstDay={firstDay}
        selectedEvent={selectedEvent}
        allowDragToEdit={true}
        dragStep={15}
        allowPinchToZoom={true}
        onPressBackground={handlePressBackground}
        onLongPressEvent={handleLongPressEvent}
        onDragSelectedEventStart={(event) => handleDragStart(event)}
        onDragSelectedEventEnd={(event) => handleDragEnd(event)}
      >
        <CalendarHeader />
        <CalendarBody
          hourFormat="h a"
          renderDraggableEvent={renderDraggableEvent}
          renderDraggingEvent={renderDraggingEvent}
        />
      </CalendarContainer>
    </Container>
  );
}

const Container = styled.View`
  height: ${windowHeight * 0.68}px;
`;
