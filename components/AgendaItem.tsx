import React from "react";

import { Dimensions } from "react-native";
import { styled } from "styled-components/native";

import { colors } from "@/assets/Themes/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

type AgendaItemProps = {
  assignmentName: string;
  courseName: string;
  dueDate: string;
  courseColor: string;
};

export function AgendaItem({
  assignmentName,
  courseName,
  dueDate,
  courseColor,
}: AgendaItemProps) {
  const formattedTime = new Date(dueDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Container courseColor={courseColor}>
      <TopRow>
        <AssignmentName>{assignmentName}</AssignmentName>
        <DueTime>{formattedTime}</DueTime>
      </TopRow>
      <BottomRow>
        <CourseName courseColor={courseColor}>{courseName}</CourseName>
      </BottomRow>
    </Container>
  );
}

const Container = styled.View<{ courseColor: string }>`
  background-color: ${colors.backgroundSecondary};
  border-radius: ${windowWidth * 0.02}px;
  padding: ${windowWidth * 0.04}px;
  margin-bottom: ${windowWidth * 0.02}px;
  border-left-width: ${windowWidth * 0.015}px;
  border-left-color: ${(props) => props.courseColor};
`;

const TopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${windowHeight * 0.01}px;
`;

const AssignmentName = styled.Text`
  font-size: ${windowWidth * 0.04}px;
  font-weight: 600;
  color: ${colors.textPrimary};
  flex: 1;
  margin-right: ${windowWidth * 0.02}px;
`;

const DueTime = styled.Text`
  font-size: ${windowWidth * 0.035}px;
  color: ${colors.textSecondary};
`;

const BottomRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CourseName = styled.Text<{ courseColor: string }>`
  font-size: ${windowWidth * 0.035}px;
  color: ${(props) => props.courseColor};
  font-weight: 500;
`;
