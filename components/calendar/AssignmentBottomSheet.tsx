import { useEffect, useMemo, useRef, useState } from "react";

import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ActivityIndicator, Dimensions } from "react-native";
import { styled } from "styled-components/native";

import { lightToDarkColorMap } from "@/assets/Themes/colors";
import { AgendaItem } from "@/components/agenda/AgendaItem";
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

type Quote = {
  q: string; // quote text
  a: string; // author
  h: string; // html formatted
};

function AssignmentDetail({ assignment, onPressBack }: AssignmentDetailProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const response = await fetch("https://zenquotes.io/api/today");
        const data = await response.json();

        if (data && data.length > 0) {
          setQuote(data[0]);
        }
      } catch (error) {
        console.error("Error fetching quote:", error);
      } finally {
        setIsLoadingQuote(false);
      }
    }

    fetchQuote();
  }, []);

  return (
    <BottomSheetView
      style={{
        flex: 1,
        paddingHorizontal: windowWidth * 0.05,
        paddingBottom: windowHeight * 0.05,
      }}
    >
      <HeaderRow>
        <Container>
          <AgendaItem
            assignmentId={assignment.id}
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
      </HeaderRow>

      <QuoteContainer courseColor={assignment.course.courseColor}>
        {isLoadingQuote ? (
          <ActivityIndicator size="small" color="#666" />
        ) : quote ? (
          <>
            <QuoteText>&ldquo;{quote.q}&rdquo;</QuoteText>
            <QuoteAuthor>— {quote.a}</QuoteAuthor>
          </>
        ) : null}
      </QuoteContainer>
    </BottomSheetView>
  );
}

const Container = styled.View`
  flex: 1;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${windowWidth * 0.04}px;
`;

const QuoteContainer = styled.View<{ courseColor: string }>`
  margin-top: ${windowHeight * 0.03}px;
  padding: ${windowWidth * 0.04}px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border-left-width: 4px;
  border-left-color: ${(props) => lightToDarkColorMap[props.courseColor]};
`;

const QuoteText = styled.Text`
  font-size: 15px;
  font-style: italic;
  color: #2d3436;
  line-height: 22px;
`;

const QuoteAuthor = styled.Text`
  font-size: 13px;
  color: #636e72;
  margin-top: 8px;
  text-align: right;
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
          assignmentId={item.id}
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
