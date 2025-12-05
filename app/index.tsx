import React, { useEffect, useMemo, useRef, useState } from "react";

import { ActivityIndicator, Dimensions, FlatList } from "react-native";
import { styled } from "styled-components/native";

import { colors } from "@/assets/Themes/colors";
import { AgendaItem } from "@/components/AgendaItem";
import { Screen } from "@/components/Screen";
import { fetchAssignments, type Assignment } from "@/utils/supabaseQueries";
import {
  createTimeline,
  findTodayIndex,
  type TimelineItem,
} from "@/utils/timelineUtils";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const ASSIGNMENTS_BATCH_SIZE = 7; // Load 7 past assignment dates at a time

export default function AgendaScreen() {
  return (
    <Screen>
      <Header>
        <HeaderText>My Assignments</HeaderText>
      </Header>
      <AgendaContent />
    </Screen>
  );
}

function AgendaContent() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTopDateLabel, setCurrentTopDateLabel] = useState<string | null>(
    null,
  );
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

  // Memorize timeline to avoid recalculating on every render; rerender when assignments change
  const fullTimeline = useMemo(
    () => createTimeline(assignments),
    [assignments],
  );

  // Find the index of today's date in the timeline
  const todayIndex = useMemo(
    () => findTodayIndex(fullTimeline),
    [fullTimeline],
  );

  // Initialize to start at today's date
  useEffect(() => {
    if (!loading && todayIndex >= 0 && fullTimeline[todayIndex]) {
      setCurrentTopDateLabel(fullTimeline[todayIndex].label);
    }
  }, [loading, todayIndex, fullTimeline]);

  // Find the index of currentTopDateLabel in the timeline
  const displayStartIndex = useMemo(() => {
    if (currentTopDateLabel === null) return null;
    const index = fullTimeline.findIndex(
      (item) => item.label === currentTopDateLabel,
    );
    return index >= 0 ? index : 0;
  }, [fullTimeline, currentTopDateLabel]);

  // Timeline slice to display
  const displayedTimeline = useMemo(() => {
    if (displayStartIndex === null || displayStartIndex === 0) {
      return fullTimeline;
    }

    return fullTimeline.slice(displayStartIndex);
  }, [fullTimeline, displayStartIndex]);

  // Handle scrolling to the top to load more past assignments
  const handleStartReached = () => {
    if (displayStartIndex !== null && displayStartIndex > 0) {
      const newStartIndex = Math.max(
        0,
        displayStartIndex - ASSIGNMENTS_BATCH_SIZE,
      );

      // Update the top date label to new starting date
      if (fullTimeline[newStartIndex]) {
        setCurrentTopDateLabel(fullTimeline[newStartIndex].label);
      }
    }
  };

  if (loading || displayStartIndex === null) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.accentColor}
        style={{ marginTop: 50 }}
      />
    );
  }

  if (error) {
    return <ErrorText>An error has occurred: {error}</ErrorText>;
  }

  return (
    <FlatList
      ref={flatListRef}
      data={displayedTimeline}
      renderItem={({ item }) => <TimelineSection item={item} />}
      keyExtractor={(item) => item.label}
      windowSize={windowHeight / 20}
      onStartReached={handleStartReached}
      onStartReachedThreshold={0.5}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
      contentContainerStyle={{
        paddingHorizontal: windowHeight * 0.02,
        paddingBottom: windowHeight * 0.02,
      }}
    />
  );
}

function TimelineSection({ item }: { item: TimelineItem }) {
  return (
    <DateSection>
      <DateHeader>{item.label}</DateHeader>
      {item.assignments.map((assignment) => (
        <AgendaItem
          key={assignment.id}
          assignmentName={assignment.assignment_name}
          courseName={assignment.course.course_name}
          dueDate={assignment.due_date}
          courseColor={assignment.course.course_color}
        />
      ))}
    </DateSection>
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
