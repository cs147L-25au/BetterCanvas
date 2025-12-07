import { Dimensions } from "react-native";
import { styled } from "styled-components/native";

import { AlertTooltip } from "@/components/AlertTooltip";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

type OutdatedAssignmentsIndicatorProps = {
  loading: boolean;
  error?: string;
};

export function OutdatedAssignmentsIndicator({
  loading,
  error,
}: OutdatedAssignmentsIndicatorProps) {
  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <AlertTooltip width={194} message="Error fetching assignments" />
      </Container>
    );
  }

  return null;
}

const Container = styled.View`
  position: absolute;
  top: ${windowHeight * 0.09}px;
  left: ${windowWidth * 0.05}px;
  align-items: flex-start;
  justify-content: flex-start;
`;
