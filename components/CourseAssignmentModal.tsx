import React, { useEffect, useState } from "react";

import { Modal, Text, FlatList, Dimensions } from "react-native";
import { styled } from "styled-components/native";

import { colors, lightToDarkColorMap } from "@/assets/Themes/colors";
import { AgendaItem } from "@/components/agenda/AgendaItem";
import {
  fetchAssignments,
  type Assignment,
  type Course,
} from "@/utils/supabaseQueries";

const windowHeight = Dimensions.get("window").height;

interface CourseAssignmentsModalProps {
  visible: boolean;
  onClose: () => void;
  course: Course | null;
}

export const CourseAssignmentsModal: React.FC<CourseAssignmentsModalProps> = ({
  visible,
  onClose,
  course,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && course) {
      setLoading(true);
      fetchAssignments().then((all) => {
        setAssignments(
          all.filter((a) => a.course.courseName === course.course_name),
        );

        setLoading(false);
      });
    } else {
      setAssignments([]);
    }
  }, [visible, course]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <ModalBackground>
        <ModalContainer>
          <Header course={course}>
            {course
              ? `${course.course_number}: ${course.course_name}`
              : "Course Assignments"}
          </Header>
          {loading ? (
            <Text>Loading...</Text>
          ) : assignments.length === 0 ? (
            <EmptyState>No assignments for this course yet</EmptyState>
          ) : (
            <AssignmentsContainer>
              <FlatList
                data={assignments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <AgendaItem
                    assignmentName={item.assignmentName}
                    courseName={course?.course_name || ""}
                    dueDate={item.dueDate}
                    courseColor={course?.course_color || colors.accentColor}
                  />
                )}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            </AssignmentsContainer>
          )}
          <CloseButton onPress={onClose}>
            <CloseButtonText>Close</CloseButtonText>
          </CloseButton>
        </ModalContainer>
      </ModalBackground>
    </Modal>
  );
};

const AssignmentsContainer = styled.View`
  width: 100%;
  padding: 0 8px;
  flex-grow: 1;
  min-height: ${windowHeight * 0.06}px;
  max-height: ${windowHeight * 0.4}px;
`;

const ModalBackground = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.View`
  width: 90%;
  max-height: 80%;
  background-color: ${colors.background};
  border-radius: ${windowHeight * 0.02}px;
  padding: ${windowHeight * 0.02}px;
  align-items: center;
`;

const Header = styled.Text<{ course: Course | null }>`
  font-size: ${windowHeight * 0.025}px;
  font-weight: bold;
  margin-bottom: ${windowHeight * 0.02}px;
  color: ${({ course }) =>
    course ? lightToDarkColorMap[course.course_color] : colors.accentColor};
  text-align: center;
`;

const EmptyState = styled.Text`
  font-size: ${windowHeight * 0.02}px;
  text-align: center;
  color: ${colors.textSecondary};
  margin-top: ${windowHeight * 0.02}px;
  font-style: italic;
`;

const CloseButton = styled.TouchableOpacity`
  margin-top: ${windowHeight * 0.02}px;
  background-color: ${colors.accentColor};
  padding: ${windowHeight * 0.01}px ${windowHeight * 0.04}px;
  border-radius: 8px;
`;

const CloseButtonText = styled.Text`
  color: white;
  font-size: ${windowHeight * 0.02}px;
  font-weight: bold;
`;
