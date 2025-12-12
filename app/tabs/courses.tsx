import React, { useEffect, useState } from "react";


import { useRouter } from "expo-router";
import { FlatList, TouchableOpacity, Dimensions, Alert } from "react-native";
import { styled } from "styled-components/native";


import { colors, lightToDarkColorMap } from "@/assets/Themes/colors";
import { CourseAssignmentsModal } from "@/components/CourseAssignmentsModal";
import { Screen } from "@/components/Screen";
import { signOut } from "@/utils/auth";
import { fetchUserCourses, type Course } from "@/utils/supabaseQueries";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const SQUARE_SIZE = windowWidth * 0.4;

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserCourses().then(setCourses);
  }, []);

  async function handleLogout() {
    const { error } = await signOut();
    if (error) {
      Alert.alert("Error", "Failed to sign out");
    } else {
      router.replace("/login");
    }
  }

  // Group courses into rows of 2
  const rows = [];
  for (let i = 0; i < courses.length; i += 2) {
    rows.push(courses.slice(i, i + 2));
  }

  return (
    <Screen>
      <Header>
        <HeaderText>My Courses</HeaderText>
      </Header>
      <Content>
        <FlatList
          data={rows}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item: row }) => (
            <Row>
              {row.map((course) => (
                <CourseSquare
                  key={course.id}
                  onPress={() => {
                    setSelectedCourse(course);
                    setModalVisible(true);
                  }}
                >
                  <TopHalf color={lightToDarkColorMap[course.course_color]} />
                  <BottomHalf color={course.course_color}>
                    <CourseText>
                      {course.course_number}: {course.course_name}
                    </CourseText>
                  </BottomHalf>
                </CourseSquare>
              ))}
              {row.length < 2 && <CourseSquare style={{ opacity: 0 }} />}
            </Row>
          )}
          contentContainerStyle={{ padding: 16 }}
        />
        <CourseAssignmentsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          course={selectedCourse}
        />
        <LogoutButton onPress={handleLogout}>
          <LogoutButtonText>Log Out</LogoutButtonText>
        </LogoutButton>
      </Content>
    </Screen>
  );
}

const Header = styled.View`
  height: ${windowHeight * 0.1}px;
  background-color: ${colors.background};
  justify-content: center;
  padding-left: ${windowWidth * 0.05}px;
`;

const HeaderText = styled.Text`
  font-size: ${windowHeight * 0.04}px;
  font-weight: bold;
  color: ${colors.accentColor};
`;

const Content = styled.View`
  flex: 1;
  padding: ${windowWidth * 0.035}px;
`;

const LogoutButton = styled.Pressable`
  background-color: ${colors.accentColor};
  padding: 15px;
  border-radius: 8px;
  align-items: center;
  margin-bottom: ${windowHeight * 0.06}px;
`;

const LogoutButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 600;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${windowWidth * 0.04}px;
`;

const CourseSquare = styled(TouchableOpacity)`
  width: ${SQUARE_SIZE}px;
  height: ${SQUARE_SIZE}px;
  border-radius: ${windowWidth * 0.04}px;
  overflow: hidden;
  margin-bottom: 0;
`;

const TopHalf = styled.View<{ color: string }>`
  flex: 0.9;
  background-color: ${({ color }) => color};
`;

const BottomHalf = styled.View<{ color: string }>`
  flex: 1.1;
  background-color: ${({ color }) => color};
  justify-content: center;
  align-items: center;
`;

const CourseText = styled.Text`
  color: ${colors.textPrimary};
  font-size: ${windowWidth * 0.035}px;
  font-weight: bold;
  text-align: center;
  padding: ${windowWidth * 0.02}px;
`;
