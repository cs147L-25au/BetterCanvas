import React, { useState, useEffect, useMemo, useRef } from "react";
import { Dimensions, ActivityIndicator, FlatList } from "react-native";
import styled from "styled-components/native";
import { Screen } from "@/components/Screen";
import { AgendaItem } from "@/components/AgendaItem";
import { colors } from "@/assets/Themes/colors";
import { fetchAssignments, type Assignment } from "@/utils/supabaseQueries";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function AgendaScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Fetch assignments
  useEffect(() => {
    async function loadAssignments() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAssignments();
        setAssignments(data);
      } catch (err) {
        setError("Failed to fetch assignments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  // Create timeline for days without assignments
  const createTimeline = () => {
    if (assignments.length === 0) return [];
    const sorted = [...assignments].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    const timeline: Array<{
      type: "date" | "gap";
      label: string;
      assignments?: Assignment[];
      dateKey: string;
    }> = [];

    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const startDate = new Date(
      new Date(sorted[0].due_date).setHours(0, 0, 0, 0)
    );

    let firstDate;
    if (startDate < today) {
      firstDate = startDate;
    } else {
      firstDate = today;
    }

    let currentDate = new Date(firstDate);
    const finalDate = new Date(
      new Date(sorted[sorted.length - 1].due_date).setHours(0, 0, 0, 0)
    );

    // Group assignments by date
    const assignmentsByDate: Record<string, Assignment[]> = {};
    for (const assignment of sorted) {
      const dateKey = new Date(assignment.due_date).toDateString();
      if (!assignmentsByDate[dateKey]) {
        assignmentsByDate[dateKey] = [];
      }
      assignmentsByDate[dateKey].push(assignment);
    }

    let gapStart: Date | null = null;
    const todayKey = today.toDateString();

    // Helper to add a date section to the timeline
    const addDateSection = (
      date: Date,
      assignments?: Assignment[],
      isToday = false
    ) => {
      let label = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      if (isToday) {
        label = "Today: " + label;
      }

      timeline.push({
        type: "date",
        label,
        assignments,
        dateKey: date.toDateString(),
      });
    };

    // Closes gaps between assignments and add to timeline
    const closeGap = (endDate: Date) => {
      if (gapStart) {
        timeline.push({
          type: "gap",
          label: formatDateRange(gapStart, endDate),
          dateKey: `gap-${gapStart.getTime()}`,
        });
        gapStart = null;
      }
    };

    while (currentDate <= finalDate) {
      const dateKey = currentDate.toDateString();
      const hasAssignments = assignmentsByDate[dateKey];
      const isToday = dateKey === todayKey;

      if (hasAssignments || isToday) {
        const gapEnd = new Date(currentDate);
        gapEnd.setDate(gapEnd.getDate() - 1);
        closeGap(gapEnd);

        addDateSection(currentDate, hasAssignments, isToday);

        if (isToday && !hasAssignments) {
          const nextDate = new Date(currentDate);
          nextDate.setDate(nextDate.getDate() + 1);
          gapStart = nextDate;
        }
      } else if (!gapStart) {
        gapStart = new Date(currentDate);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Close any remaining gap
    if (gapStart) {
      const gapEnd = new Date(currentDate);
      gapEnd.setDate(gapEnd.getDate() - 1);
      timeline.push({
        type: "gap",
        label: formatDateRange(gapStart, gapEnd),
        dateKey: `gap-${gapStart.getTime()}`,
      });
    }

    return timeline;
  };

  // Format dates for gaps
  const formatDateRange = (start: Date, end: Date): string => {
    const startStr = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endStr = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (start.toDateString() === end.toDateString()) {
      return `${startStr}`;
    }
    return `${startStr} - ${endStr}`;
  };

  // Memorize timeline to avoid recalculating on every render; rerender when assignments change
  const timeline = useMemo(() => {
    return createTimeline();
  }, [assignments]);

  // Find the index of today's date in the timeline
  const todayIndex = useMemo(() => {
    const todayKey = new Date().toDateString();
    return timeline.findIndex((item) => item.dateKey === todayKey);
  }, [timeline]);

  // Scroll to today's date on load
  useEffect(() => {
    if (!loading && todayIndex >= 0 && flatListRef.current) {
      const scrollTimer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: todayIndex,
          animated: true,
          viewPosition: 0,
        });
      }, 300);

      return () => clearTimeout(scrollTimer);
    }
  }, [loading, todayIndex]);

  // Render a single timeline item
  const renderItem = ({ item }: { item: (typeof timeline)[0] }) => {
    let assignmentContent;
    if (item.type === "date" && item.assignments) {
      assignmentContent = item.assignments.map((assignment) => (
        <AgendaItem
          key={assignment.id}
          assignmentName={assignment.assignment_name}
          courseName={assignment.course_name}
          dueDate={assignment.due_date}
          courseColor={assignment.course_color}
        />
      ));
    } else {
      assignmentContent = (
        <NoAssignmentsText>No assignments due</NoAssignmentsText>
      );
    }

    return (
      <DateSection>
        <DateHeader>{item.label}</DateHeader>
        {assignmentContent}
      </DateSection>
    );
  };

  return (
    <Screen>
      <Header>
        <HeaderText>My Assignments</HeaderText>
      </Header>
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.accentColor}
          style={{ marginTop: 50 }}
        />
      )}

      {error && <ErrorText>An error has occurred: {error}</ErrorText>}

      {!loading && !error && (
        <FlatList
          ref={flatListRef}
          data={timeline}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          initialNumToRender={50}
          maxToRenderPerBatch={10}
          windowSize={21}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0,
              });
            });
          }}
          contentContainerStyle={{
            paddingHorizontal: windowHeight * 0.02,
            paddingBottom: windowHeight * 0.02,
          }}
        />
      )}
    </Screen>
  );
}

const Header = styled.View`
  height: ${windowHeight * 0.1}px;
  background-color: ${colors.background};
  justify-content: center;
  padding-left: ${windowWidth * 0.05}px;
`;

const HeaderText = styled.Text`
  font-size: ${windowHeight * 0.04}px;
  font-weight: bold;
  color: ${colors.accentColor};
`;

const ErrorText = styled.Text`
  font-size: ${windowHeight * 0.04}px;
  text-align: center;
  color: ${colors.textError};
  margin-top: ${windowHeight * 0.07}px;
  padding: ${windowHeight * 0.07}px;
`;

const DateSection = styled.View`
  margin-bottom: ${windowHeight * 0.03}px;
`;

const DateHeader = styled.Text`
  font-size: ${windowWidth * 0.045}px;
  font-weight: bold;
  color: ${colors.textPrimary};
  margin-bottom: ${windowHeight * 0.015}px;
  padding-left: ${windowWidth * 0.01}px;
`;

const NoAssignmentsText = styled.Text`
  font-size: ${windowWidth * 0.04}px;
  color: ${colors.textSecondary};
  font-style: italic;
  padding: ${windowHeight * 0.02}px;
  text-align: center;
`;
