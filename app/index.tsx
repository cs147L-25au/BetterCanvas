import React, { useState, useEffect, useMemo, useRef } from "react";

import { Dimensions, ActivityIndicator, FlatList } from "react-native";
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

  // Memorize timeline to avoid recalculating on every render; rerender when assignments change
  const timeline = useMemo(() => createTimeline(assignments), [assignments]);

  // Find the index of today's date in the timeline
  const todayIndex = useMemo(() => findTodayIndex(timeline), [timeline]);

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
  const renderItem = ({ item }: { item: TimelineItem }) => {
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
          windowSize={windowHeight / 20}
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
