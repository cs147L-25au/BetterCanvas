import { useEffect, useMemo, useState } from "react";

import type { EventItem } from "@howljs/calendar-kit";
import { Dimensions } from "react-native";
import { styled } from "styled-components/native";

import { AlertTooltip } from "@/components/AlertTooltip";
import { Calendar } from "@/components/Calendar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Screen } from "@/components/Screen";
import { createDueDateEvents } from "@/utils/calendarUtils";
import { type Assignment, fetchAssignments } from "@/utils/supabaseQueries";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export default function CalendarScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAssignments() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAssignments();
      setAssignments(data);
    } catch (err) {
      setError("Failed to fetch assignments: " + err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  const dueDates: EventItem[] = useMemo(() => {
    return createDueDateEvents(assignments);
  }, [assignments]);

  return (
    <Screen>
      <Calendar events={dueDates} />
      <OutdatedAssignmentsIndicator loading={loading} error={error} />
    </Screen>
  );
}

type OutdatedAssignmentsIndicatorProps = {
  loading: boolean;
  error: string | null;
};

function OutdatedAssignmentsIndicator({
  loading,
  error,
}: OutdatedAssignmentsIndicatorProps) {
  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <AlertTooltip width={194} message="Error fetching assignments" />
      </Container>
    );
  }

  return null;
}

const Container = styled.View`
  position: absolute;
  top: ${windowHeight * 0.09}px;
  left: ${windowWidth * 0.05}px;
  align-items: flex-start;
  justify-content: flex-start;
`;
