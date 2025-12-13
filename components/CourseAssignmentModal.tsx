import React from "react";

import { Modal, Text, FlatList, Dimensions } from "react-native";
import { styled } from "styled-components/native";

import { colors, lightToDarkColorMap } from "@/assets/Themes/colors";
import { AgendaItem } from "@/components/agenda/AgendaItem";
import { optimisticUpdateChecked } from "@/utils/supabaseQueries";
import { type Course, type Assignment } from "@/utils/supabaseQueries";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

interface CourseAssignmentsModalProps {
  visible: boolean;
  onClose: () => void;
  course: Course | null;
  assignments: Assignment[];
  loading: boolean;
  error?: string;
}

export const CourseAssignmentsModal: React.FC<CourseAssignmentsModalProps> = ({
  visible,
  onClose,
  course,
  assignments,
  loading,
  error,
}) => {
  // Filter assignments for the selected course
  const [localAssignments, setLocalAssignments] = React.useState(assignments);
  React.useEffect(() => {
    setLocalAssignments(assignments);
  }, [assignments]);

  const filteredAssignments = course
    ? localAssignments.filter((a) => a.course.courseName === course.courseName)
    : [];

  const handleCheckedChange = async (
    assignmentId: string,
    checked: boolean,
  ) => {
    try {
      await optimisticUpdateChecked(assignmentId, checked, setLocalAssignments);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <ModalBackground>
        <ModalContainer>
          <HeaderContainer>
            <Header course={course}>
              {course
                ? `${course.courseNumber}: ${course.courseName}`
                : "Course Assignments"}
            </Header>
            <CloseButton onPress={onClose}>
              <CloseButtonText>×</CloseButtonText>
            </CloseButton>
          </HeaderContainer>
          {loading ? (
            <Text>Loading...</Text>
          ) : error ? (
            <EmptyState>{error}</EmptyState>
          ) : filteredAssignments.length === 0 ? (
            <EmptyState>No assignments for this course yet</EmptyState>
          ) : (
            <AssignmentsContainer>
              <FlatList
                data={filteredAssignments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <AgendaItem
                    assignmentId={item.id}
                    assignmentName={item.assignmentName}
                    courseName={course?.courseName || ""}
                    dueDate={item.dueDate}
                    courseColor={course?.courseColor || colors.accentColor}
                    checked={item.checked}
                    onPress={() => handleCheckedChange(item.id, !item.checked)}
                  />
                )}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            </AssignmentsContainer>
          )}
        </ModalContainer>
      </ModalBackground>
    </Modal>
  );
};

const AssignmentsContainer = styled.View`
  width: 100%;
  padding: 0 8px;
  flex-grow: 1;
  max-height: ${windowHeight * 0.6}px;
`;

const ModalBackground = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const ModalContainer = styled.View`
  background-color: ${colors.background};
  border-top-left-radius: ${windowWidth * 0.05}px;
  border-top-right-radius: ${windowWidth * 0.05}px;
  padding: ${windowHeight * 0.025}px;
  height: ${windowHeight * 0.75}px;
  width: 100%;
  align-items: center;
`;

const HeaderContainer = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${windowHeight * 0.02}px;
  padding-bottom: ${windowHeight * 0.01}px;
`;

const Header = styled.Text<{ course: Course | null }>`
  flex: 1;
  font-size: ${windowHeight * 0.025}px;
  font-weight: bold;
  color: ${({ course }) =>
    course ? lightToDarkColorMap[course.courseColor] : colors.accentColor};
  text-align: center;
  padding-right: ${windowWidth * 0.08}px;
  padding-top: ${windowWidth * 0.013}px;
`;

const EmptyState = styled.Text`
  font-size: ${windowHeight * 0.02}px;
  text-align: center;
  color: ${colors.textSecondary};
  margin-top: ${windowHeight * 0.02}px;
  font-style: italic;
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  right: 0;
  top: 0;
  padding: ${windowWidth * 0.01}px;
  z-index: 1;
`;

const CloseButtonText = styled.Text`
  color: ${colors.textSecondary};
  font-size: ${windowHeight * 0.04}px;
  font-weight: 400;
  line-height: ${windowHeight * 0.04}px;
`;
