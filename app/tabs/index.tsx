import React, { useEffect, useMemo, useRef, useState } from "react";

import { Dimensions, FlatList } from "react-native";
import { styled } from "styled-components/native";

import { colors } from "@/assets/Themes/colors";
import { AddAssignment } from "@/components/agenda/AddAssignmentModal";
import { AgendaItem } from "@/components/agenda/AgendaItem";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Screen } from "@/components/Screen";
import { useAssignments } from "@/hooks/useAssignments";
import { optimisticUpdateChecked } from "@/utils/supabaseQueries";
import { createAssignment, type Assignment } from "@/utils/supabaseQueries";
import {
  createTimeline,
  findNearestAssgnIdx,
  type TimelineItem,
} from "@/utils/timelineUtils";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const ASSIGNMENTS_BATCH_SIZE = 7; // Load 7 past assignment dates at a time

export default function AgendaScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { assignments, courses, loading, error, refetch } = useAssignments();
  const [optimisticAssignments, setOptimisticAssignments] = useState<
    Assignment[] | null
  >(null);

  // Open modal directly, courses are already loaded
  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleSaveAssignment = async (assignment: {
    assignmentName: string;
    courseId: string;
    dueDate: Date;
    estimatedDuration: number;
  }) => {
    // Optimistically add to the view BEFORE any await
    const optimisticAssignment: Assignment = {
      id: Math.random().toString(36).slice(2), // temporary id
      assignmentName: assignment.assignmentName,
      dueDate: assignment.dueDate.toISOString(),
      estimatedDuration: assignment.estimatedDuration,
      course: courses.find((c) => c.id === assignment.courseId) ?? courses[0],
    };
    setOptimisticAssignments((prev) => [
      optimisticAssignment,
      ...(prev ?? assignments),
    ]);

    // Create the assignment in the DB
    await createAssignment(assignment);
    setModalVisible(false);

    // Refetch in the background to ensure data is up to date
    refetch().then(() => setOptimisticAssignments(null));
  };

  return (
    <Screen>
      <Header>
        <HeaderText>My Assignments</HeaderText>
        <AddButton onPress={handleOpenModal} disabled={loading}>
          <AddButtonText>+</AddButtonText>
        </AddButton>
      </Header>
      <AgendaContent
        assignments={optimisticAssignments ?? assignments}
        loading={loading}
        error={error}
        refetch={refetch}
      />
      <AddAssignment
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveAssignment}
        courses={courses}
      />
    </Screen>
  );
}

function AgendaContent({
  assignments,
  loading,
  error,
  refetch,
}: {
  assignments: Assignment[];
  loading: boolean;
  error: string | undefined;
  refetch: () => Promise<void>;
}) {
  // Current topmost agenda item on the screen
  const [currentTopDateLabel, setCurrentTopDateLabel] = useState<string | null>(
    null,
  );
  const flatListRef = useRef<FlatList>(null);

  // Memorize timeline to avoid recalculating on every render; rerender when assignments change
  const fullTimeline = useMemo(
    () => createTimeline(assignments),
    [assignments],
  );

  // Find the index of today's date in the timeline
  const nearestAssgnIdx = useMemo(
    () => findNearestAssgnIdx(fullTimeline),
    [fullTimeline],
  );

  // Initialize to start at nearest assignment index (today or nearest future assignment)
  useEffect(() => {
    if (!loading && nearestAssgnIdx >= 0 && fullTimeline[nearestAssgnIdx]) {
      setCurrentTopDateLabel(fullTimeline[nearestAssgnIdx].label);
    }
  }, [loading, nearestAssgnIdx, fullTimeline]);

  // Find the index of currentTopDateLabel in the timeline
  const displayStartIndex = useMemo(() => {
    if (currentTopDateLabel === null) {
      return null;
    }

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
  // This enables lazy loading where we initially show day + future, and loads more past dates on scroll up
  const handleStartReached = () => {
    // Only load if we're not already at the very beginning
    if (displayStartIndex !== null && displayStartIndex > 0) {
      // Calculate the new start position (7 dates earlier, but not before index 0)
      const newStartIndex = Math.max(
        0,
        displayStartIndex - ASSIGNMENTS_BATCH_SIZE,
      );

      // Update currentTopDateLabel to the new date, which will trigger:
      // 1. displayStartIndex recalculation finds new index for the date
      // 2. displayedTimeline re-slice to includes more past dates
      // 3. FlatList re-render with maintainVisibleContentPosition
      if (fullTimeline[newStartIndex]) {
        setCurrentTopDateLabel(fullTimeline[newStartIndex].label);
      }
    }
  };

  // Only show spinner if loading and there are no assignments to display
  if ((loading || displayStartIndex === null) && assignments.length === 0) {
    return <LoadingSpinner size="large" style={{ marginTop: 50 }} />;
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
  const [localAssignments, setLocalAssignments] = React.useState(
    item.assignments,
  );
  React.useEffect(() => {
    setLocalAssignments(item.assignments);
  }, [item.assignments]);

  const handleCheckedChange = async (
    assignmentId: string,
    checked: boolean,
  ) => {
    await optimisticUpdateChecked(assignmentId, checked, setLocalAssignments);
  };

  return (
    <DateSection>
      <DateHeader>{item.label}</DateHeader>
      {localAssignments.map((assignment) => (
        <AgendaItem
          key={assignment.id}
          assignmentId={assignment.id}
          assignmentName={assignment.assignmentName}
          courseName={assignment.course.courseName}
          dueDate={assignment.dueDate}
          courseColor={assignment.course.courseColor}
          checked={assignment.checked}
          onPress={() =>
            handleCheckedChange(assignment.id, !assignment.checked)
          }
        />
      ))}
    </DateSection>
  );
}

const Header = styled.View`
  height: ${windowHeight * 0.1}px;
  background-color: ${colors.background};
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  padding-left: ${windowWidth * 0.05}px;
  padding-right: ${windowWidth * 0.05}px;
`;

const HeaderText = styled.Text`
  font-size: ${windowHeight * 0.04}px;
  font-weight: bold;
  color: ${colors.accentColor};
`;

const AddButton = styled.TouchableOpacity<{ disabled: boolean }>`
  width: ${windowHeight * 0.05}px;
  height: ${windowHeight * 0.05}px;
  border-radius: ${windowHeight * 0.025}px;
  background-color: ${({ disabled }) =>
    disabled ? colors.textSecondary : colors.accentColor};
  justify-content: center;
  align-items: center;
`;

const AddButtonText = styled.Text`
  font-size: ${windowHeight * 0.04}px;
  color: ${colors.background};
  font-weight: bold;
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
