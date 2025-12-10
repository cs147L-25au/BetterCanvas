import { useEffect, useState } from "react";

import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, Dimensions, FlatList } from "react-native";
import { styled } from "styled-components/native";

import { colors } from "@/assets/Themes/colors";
import { CourseItem } from "@/components/CourseItem";
import { supabase } from "@/lib/supabase";
import type { Course } from "@/utils/supabaseQueries";
import { fetchCourses } from "@/utils/supabaseQueries";

const windowHeight = Dimensions.get("window").height;

export default function CourseSelectionScreen() {
  // List of all available courses from the database
  const [courses, setCourses] = useState<Course[]>([]);
  // Set of course IDs that the user has selected
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set(),
  );
  // Loading indicator for fetching courses
  const [loading, setLoading] = useState(true);
  // Loading indicator for saving user's selections
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  // Load all available courses when component mounts
  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch {
      Alert.alert("Error", "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  // Toggles selection of a course by adding/removing it from selectedCourses set
  function toggleCourse(courseId: string) {
    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }

      return newSet;
    });
  }

  // Saves the user's course selections to the database
  async function saveSelection() {
    if (selectedCourses.size === 0) {
      Alert.alert("Error", "Please select at least one course");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Create user_courses entries for each selected course
      const entries = Array.from(selectedCourses).map((course_id) => ({
        user_id: user.id,
        course_id,
      }));

      const { error } = await supabase.from("user_courses").insert(entries);

      if (error) {
        throw error;
      }

      // Navigate to main app tabs after successful save
      router.replace("/tabs");
    } catch {
      Alert.alert("Error", "Failed to save course selection");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Container>
        <ActivityIndicator size="large" color={colors.accentColor} />
      </Container>
    );
  }

  return (
    <Container>
      <Title>Select Your Courses</Title>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourseItem
            courseName={item.course_name}
            courseNumber={item.course_number}
            courseColor={item.course_color}
            isSelected={selectedCourses.has(item.id)}
            onPress={() => toggleCourse(item.id)}
          />
        )}
        contentContainerStyle={{ padding: 20 }}
      />

      {/* Save button - disabled if no courses selected or currently saving */}
      <SaveButton
        onPress={saveSelection}
        disabled={saving || selectedCourses.size === 0}
      >
        <SaveButtonText>
          {saving ? "Saving..." : `Continue (${selectedCourses.size} selected)`}
        </SaveButtonText>
      </SaveButton>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${colors.background};
  padding-top: ${windowHeight * 0.04}px;
`;

const Title = styled.Text`
  font-size: ${windowHeight * 0.035}px;
  font-weight: bold;
  color: ${colors.accentColor};
  text-align: center;
  margin-top: ${windowHeight * 0.08}px;
  margin-bottom: ${windowHeight * 0.01}px;
`;

const SaveButton = styled.Pressable`
  background-color: ${colors.accentColor};
  padding: ${windowHeight * 0.02}px;
  margin: ${windowHeight * 0.025}px;
  border-radius: ${windowHeight * 0.01}px;
  align-items: center;
`;

const SaveButtonText = styled.Text`
  color: white;
  font-size: ${windowHeight * 0.02}px;
  font-weight: 600;
`;
