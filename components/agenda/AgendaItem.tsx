import React, { useState } from "react";

import Ionicons from "@expo/vector-icons/Ionicons";
import { Dimensions } from "react-native";
import { styled } from "styled-components/native";

import { colors, lightToDarkColorMap } from "@/assets/Themes/colors";
import { updateUserAssignmentChecked } from "@/utils/supabaseQueries";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

// No-op function constant to avoid linting issues
const noop = () => {
  // Intentionally empty
};

type AgendaItemProps = {
  assignmentId: string;
  assignmentName: string;
  courseName: string;
  dueDate: string;
  courseColor: string;
  checked?: boolean;
  onPress?: () => void;
  compact?: boolean;
};

export function AgendaItem({
  assignmentId,
  assignmentName,
  courseName,
  dueDate,
  courseColor,
  checked = false,
  onPress = noop,
  compact = false,
}: AgendaItemProps) {
  const [isChecked, setIsChecked] = useState(checked);

  // Keep isChecked in sync with checked prop
  React.useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const formattedTime = new Date(dueDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const handleCheckboxPress = async () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    try {
      await updateUserAssignmentChecked(assignmentId, newChecked);
    } catch (err) {
      // Optionally handle error (e.g., revert UI, show message)
      setIsChecked(!newChecked);
      console.log(err);
    }
  };

  return (
    <Container
      courseColor={courseColor}
      isChecked={isChecked}
      onPress={onPress}
    >
      <ContentWrapper>
        {compact ? null : (
          <CheckboxButton onPress={handleCheckboxPress}>
            <Ionicons
              name={isChecked ? "checkbox" : "square-outline"}
              size={windowWidth * 0.065}
              color={lightToDarkColorMap[courseColor]}
            />
          </CheckboxButton>
        )}
        <TextContent>
          <TopRow>
            <AssignmentName isChecked={isChecked}>
              {assignmentName}
            </AssignmentName>
            <DueTime>{formattedTime}</DueTime>
          </TopRow>
          <BottomRow>
            <CourseName courseColor={courseColor}>{courseName}</CourseName>
          </BottomRow>
        </TextContent>
      </ContentWrapper>
    </Container>
  );
}

const Container = styled.Pressable<{ courseColor: string; isChecked: boolean }>`
  background-color: ${(props) => props.courseColor};
  border-radius: ${windowWidth * 0.02}px;
  padding: ${windowWidth * 0.04}px;
  margin-bottom: ${windowWidth * 0.02}px;
  border-left-width: ${windowWidth * 0.015}px;
  border-left-color: ${(props) => lightToDarkColorMap[props.courseColor]};
  /* Lower the opacity of the agenda item when checked */
  opacity: ${(props) => (props.isChecked ? 0.4 : 1)};
`;

const ContentWrapper = styled.View`
  flex-direction: row;
  align-items: flex-start;
`;

const CheckboxButton = styled.Pressable`
  margin-right: ${windowWidth * 0.03}px;
  padding: ${windowWidth * 0.005}px;
`;

const TextContent = styled.View`
  flex: 1;
`;

const TopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${windowHeight * 0.01}px;
`;

const AssignmentName = styled.Text<{ isChecked: boolean }>`
  font-size: ${windowWidth * 0.04}px;
  font-weight: 600;
  color: ${colors.textPrimary};
  flex: 1;
  margin-right: ${windowWidth * 0.02}px;
  /* Strike through assignment when checkbox is checked */
  text-decoration-line: ${(props) =>
    props.isChecked ? "line-through" : "none"};
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
  color: ${(props) => lightToDarkColorMap[props.courseColor]};
  font-weight: 500;
`;
