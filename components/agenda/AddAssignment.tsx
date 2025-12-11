import React, { useState } from "react";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Dimensions, Modal, Platform, ScrollView } from "react-native";
import { styled } from "styled-components/native";

import { colors, lightToDarkColorMap } from "@/assets/Themes/colors";
import type { Course } from "@/utils/supabaseQueries";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

interface AddAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (assignment: {
    assignmentName: string;
    courseId: string;
    dueDate: Date;
    estimatedDuration: number;
  }) => Promise<void>;
  courses: Course[];
}

export function AddAssignment({
  visible,
  onClose,
  onSave,
  courses,
}: AddAssignmentModalProps) {
  const [assignmentName, setAssignmentName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [dueDate, setDueDate] = useState(new Date());
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setAssignmentName("");
    setSelectedCourseId("");
    setDueDate(new Date());
    setEstimatedDuration("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    // Validation
    if (!assignmentName.trim()) {
      setError("Please enter an assignment name");
      return;
    }

    if (!selectedCourseId) {
      setError("Please select a course");
      return;
    }

    if (!estimatedDuration || Number(estimatedDuration) <= 0) {
      setError("Please enter a valid duration (in hours)");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        assignmentName: assignmentName.trim(),
        courseId: selectedCourseId,
        dueDate,
        estimatedDuration: Number(estimatedDuration),
      });

      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save assignment",
      );
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      // Preserve the time when changing date
      const newDate = new Date(selectedDate);
      newDate.setHours(dueDate.getHours());
      newDate.setMinutes(dueDate.getMinutes());
      setDueDate(newDate);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "set" && selectedTime) {
      // Preserve the date when changing time
      const newDate = new Date(dueDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDueDate(newDate);
    }
  };

  const handleDateButtonPress = () => {
    setShowTimePicker(false);
    setShowDatePicker((prev) => !prev);
  };

  const handleTimeButtonPress = () => {
    setShowDatePicker(false);
    setShowTimePicker((prev) => !prev);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add Assignment</ModalTitle>
            <CloseButton onPress={handleClose}>
              <CloseButtonText>×</CloseButtonText>
            </CloseButton>
          </ModalHeader>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={true}
          >
            <FormSection>
              <Label>Assignment Name</Label>
              <Input
                value={assignmentName}
                onChangeText={setAssignmentName}
                placeholder="e.g., Problem Set 3"
                placeholderTextColor={colors.textSecondary}
              />
            </FormSection>

            <FormSection>
              <Label>Course</Label>
              {courses.length === 0 ? (
                <NoCourseText>
                  No courses available. Please add courses first.
                </NoCourseText>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 8 }}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {courses.map((course) => (
                    <CourseChip
                      key={course.id}
                      selected={selectedCourseId === course.id}
                      onPress={() => setSelectedCourseId(course.id)}
                      color={lightToDarkColorMap[course.course_color]}
                    >
                      <CourseChipText selected={selectedCourseId === course.id}>
                        {course.course_number}
                      </CourseChipText>
                    </CourseChip>
                  ))}
                </ScrollView>
              )}
            </FormSection>

            <FormSection>
              <Label>Due Date</Label>
              <DateTimeRow>
                <DateButton onPress={handleDateButtonPress}>
                  <DateButtonText>
                    {dueDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </DateButtonText>
                </DateButton>
                <TimeButton onPress={handleTimeButtonPress}>
                  <DateButtonText>{formatTime(dueDate)}</DateButtonText>
                </TimeButton>
              </DateTimeRow>
              {showDatePicker && (
                <PickerContainer>
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onDateChange}
                    textColor={colors.textPrimary}
                  />
                </PickerContainer>
              )}
              {showTimePicker && (
                <PickerContainer>
                  <DateTimePicker
                    value={dueDate}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onTimeChange}
                    textColor={colors.textPrimary}
                  />
                </PickerContainer>
              )}
            </FormSection>

            <FormSection>
              <Label>Estimated Duration (hours)</Label>
              <Input
                value={estimatedDuration}
                onChangeText={setEstimatedDuration}
                placeholder="e.g., 2.5"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </FormSection>

            {error && <ErrorText>{error}</ErrorText>}
          </ScrollView>

          <ButtonContainer>
            <CancelButton onPress={handleClose}>
              <CancelButtonText>Cancel</CancelButtonText>
            </CancelButton>
            <SaveButton onPress={handleSave} disabled={saving}>
              <SaveButtonText>{saving ? "Saving..." : "Save"}</SaveButtonText>
            </SaveButton>
          </ButtonContainer>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
}

const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const ModalContent = styled.View`
  background-color: ${colors.background};
  border-top-left-radius: ${windowWidth * 0.05}px;
  border-top-right-radius: ${windowWidth * 0.05}px;
  padding: ${windowHeight * 0.025}px;
  height: ${windowHeight * 0.75}px;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${windowHeight * 0.02}px;
`;

const ModalTitle = styled.Text`
  font-size: ${windowHeight * 0.028}px;
  font-weight: bold;
  color: ${colors.textPrimary};
`;

const CloseButton = styled.TouchableOpacity`
  padding: ${windowWidth * 0.02}px;
`;

const CloseButtonText = styled.Text`
  font-size: ${windowHeight * 0.04}px;
  color: ${colors.textSecondary};
`;

const FormSection = styled.View`
  margin-bottom: ${windowHeight * 0.025}px;
`;

const Label = styled.Text`
  font-size: ${windowHeight * 0.02}px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin-bottom: ${windowHeight * 0.01}px;
`;

const Input = styled.TextInput`
  background-color: ${colors.backgroundSecondary};
  border-radius: ${windowWidth * 0.02}px;
  padding: ${windowHeight * 0.015}px ${windowWidth * 0.04}px;
  font-size: ${windowHeight * 0.018}px;
  color: ${colors.textPrimary};
`;

const NoCourseText = styled.Text`
  font-size: ${windowHeight * 0.016}px;
  color: ${colors.textSecondary};
  font-style: italic;
  margin-top: ${windowHeight * 0.01}px;
`;

const CourseChip = styled.TouchableOpacity<{
  selected: boolean;
  color: string;
}>`
  background-color: ${({ selected, color }) =>
    selected ? color : colors.backgroundSecondary};
  border-radius: ${windowWidth * 0.05}px;
  padding: ${windowHeight * 0.01}px ${windowWidth * 0.04}px;
  margin-right: ${windowWidth * 0.02}px;
  border-width: 2px;
  border-color: ${({ selected, color }) => (selected ? color : "transparent")};
`;

const CourseChipText = styled.Text<{ selected: boolean }>`
  font-size: ${windowHeight * 0.016}px;
  color: ${({ selected }) =>
    selected ? colors.background : colors.textPrimary};
  font-weight: ${({ selected }) => (selected ? "600" : "400")};
`;

const DateTimeRow = styled.View`
  flex-direction: row;
  gap: ${windowWidth * 0.03}px;
`;

const DateButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${colors.backgroundSecondary};
  border-radius: ${windowWidth * 0.02}px;
  padding: ${windowHeight * 0.015}px ${windowWidth * 0.04}px;
`;

const TimeButton = styled.TouchableOpacity`
  background-color: ${colors.backgroundSecondary};
  border-radius: ${windowWidth * 0.02}px;
  padding: ${windowHeight * 0.015}px ${windowWidth * 0.04}px;
  min-width: ${windowWidth * 0.25}px;
  align-items: center;
`;

const DateButtonText = styled.Text`
  font-size: ${windowHeight * 0.018}px;
  color: ${colors.textPrimary};
`;

const ErrorText = styled.Text`
  color: ${colors.textError};
  font-size: ${windowHeight * 0.016}px;
  text-align: center;
  margin-top: ${windowHeight * 0.01}px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${windowHeight * 0.02}px;
  gap: ${windowWidth * 0.03}px;
`;

const CancelButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${colors.backgroundSecondary};
  border-radius: ${windowWidth * 0.02}px;
  padding: ${windowHeight * 0.018}px;
  align-items: center;
`;

const CancelButtonText = styled.Text`
  font-size: ${windowHeight * 0.02}px;
  color: ${colors.textPrimary};
  font-weight: 600;
`;

const SaveButton = styled.TouchableOpacity<{ disabled: boolean }>`
  flex: 1;
  background-color: ${({ disabled }) =>
    disabled ? colors.textSecondary : colors.accentColor};
  border-radius: ${windowWidth * 0.02}px;
  padding: ${windowHeight * 0.018}px;
  align-items: center;
`;

const SaveButtonText = styled.Text`
  font-size: ${windowHeight * 0.02}px;
  color: ${colors.background};
  font-weight: 600;
`;

const PickerContainer = styled.View`
  margin-top: ${windowHeight * 0.015}px;
  background-color: ${colors.backgroundSecondary};
  border-radius: ${windowWidth * 0.02}px;
  padding: ${windowHeight * 0.01}px;
  align-items: center;
`;
