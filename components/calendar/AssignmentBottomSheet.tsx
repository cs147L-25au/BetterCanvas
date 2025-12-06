import { useMemo, useRef } from "react";

import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Dimensions } from "react-native";
import styled from "styled-components/native";

import { AgendaItem } from "@/components/AgendaItem";
import { type Assignment } from "@/utils/supabaseQueries";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

type Props = {
  assignments: Assignment[];
  selectedAssgn: Assignment | undefined;
  onPressAssignment: (assignment: Assignment) => void;
  onPressBack: () => void;
};

export function AssignmentBottomSheet({
  assignments,
  selectedAssgn,
  onPressAssignment,
  onPressBack,
}: Props) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["25%", "50%", "60%"], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
    >
      {selectedAssgn ? (
        <AssignmentDetail
          assignment={selectedAssgn}
          onPressBack={onPressBack}
        />
      ) : (
        <AssignmentsToTimeBlock
          assignments={assignments}
          onPressAssignment={onPressAssignment}
        />
      )}
    </BottomSheet>
  );
}

type AssignmentDetailProps = {
  assignment: Assignment;
  onPressBack: () => void;
};

function AssignmentDetail({ assignment, onPressBack }: AssignmentDetailProps) {
  return (
    <BottomSheetView
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: windowWidth * 0.04,
        paddingHorizontal: windowWidth * 0.05,
        paddingBottom: windowHeight * 0.1,
      }}
    >
      <Container>
        <AgendaItem
          assignmentName={assignment.assignmentName}
          courseName={assignment.course.courseName}
          dueDate={assignment.dueDate}
          courseColor={assignment.course.courseColor}
          compact={true}
          onPress={onPressBack}
        />
      </Container>
      <Ionicons
        name="return-up-back"
        size={24}
        color="black"
        onPress={onPressBack}
      />
    </BottomSheetView>
  );
}

const Container = styled.View`
  flex: 1;
`;

type AssignmentsToTimeBlockProps = {
  assignments: Assignment[];
  onPressAssignment: (assignment: Assignment) => void;
};

function AssignmentsToTimeBlock({
  assignments,
  onPressAssignment,
}: AssignmentsToTimeBlockProps) {
  return (
    <BottomSheetFlatList
      data={assignments}
      renderItem={({ item }: { item: Assignment }) => (
        <AgendaItem
          assignmentName={item.assignmentName}
          courseName={item.course.courseName}
          dueDate={item.dueDate}
          courseColor={item.course.courseColor}
          compact={true}
          onPress={() => onPressAssignment(item)}
        />
      )}
      contentContainerStyle={{
        paddingHorizontal: windowWidth * 0.05,
        paddingBottom: windowHeight * 0.1,
      }}
    />
  );
}
