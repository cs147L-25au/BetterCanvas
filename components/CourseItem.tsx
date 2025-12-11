import React from "react";

import { Dimensions } from "react-native";
import { styled } from "styled-components/native";

import { colors, lightToDarkColorMap } from "@/assets/Themes/colors";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

type CourseItemProps = {
  courseName: string;
  courseNumber: string;
  courseColor: string;
  isSelected: boolean;
  onPress: () => void;
};

export function CourseItem({
  courseName,
  courseNumber,
  courseColor,
  isSelected,
  onPress,
}: CourseItemProps) {
  return (
    <Container
      courseColor={courseColor}
      isSelected={isSelected}
      onPress={onPress}
    >
      <Checkbox isSelected={isSelected} courseColor={courseColor}>
        {isSelected && <CheckMark>✓</CheckMark>}
      </Checkbox>
      <CourseName>
        {courseNumber}: {courseName}
      </CourseName>
    </Container>
  );
}

const Container = styled.Pressable<{
  isSelected: boolean;
  courseColor: string;
}>`
  flex-direction: row;
  align-items: center;
  padding: ${windowHeight * 0.02}px;
  margin-bottom: ${windowHeight * 0.015}px;
  background-color: ${(props) => props.courseColor};
  border-color: ${(props) =>
    props.isSelected ? props.courseColor : "transparent"};
  border-radius: ${windowHeight * 0.015}px;
  border-width: ${windowHeight * 0.002}px;
  border-left-width: ${windowWidth * 0.015}px;
  border-left-color: ${(props) => lightToDarkColorMap[props.courseColor]};
`;

const Checkbox = styled.View<{ isSelected: boolean; courseColor: string }>`
  width: ${windowHeight * 0.03}px;
  height: ${windowHeight * 0.03}px;
  border-color: ${(props) => lightToDarkColorMap[props.courseColor]};
  border-radius: ${windowHeight * 0.005}px;
  border-width: ${windowHeight * 0.002}px;
  background-color: ${(props) =>
    props.isSelected
      ? lightToDarkColorMap[props.courseColor]
      : props.courseColor};
  justify-content: center;
  align-items: center;
  margin-right: ${windowWidth * 0.04}px;
`;

const CheckMark = styled.Text`
  color: ${colors.background};
  font-size: ${windowHeight * 0.02}px;
  font-weight: bold;
`;

const CourseName = styled.Text`
  font-size: ${windowHeight * 0.02}px;
  color: ${colors.textPrimary};
  flex: 1;
`;
