import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/colors";
import { fetchStudents } from "../../services/teachers/student";
import { saveAcademicResults } from "../../services/teachers/academics";



const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Science",
  "Social Studies",
];

export default function TeacherAcademicsScreen() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents().then((data) => {
      setStudents(data);
    });
  }, []);

  const [subject, setSubject] =
    useState(SUBJECTS[0]);

  const [scores, setScores] = useState({});

  const updateScore = (studentId, value) => {
    const numericValue = value.replace(
      /[^0-9]/g,
      ""
    );

    if (
      numericValue !== "" &&
      Number(numericValue) > 100
    ) {
      return;
    }

    setScores((current) => ({
      ...current,
      [studentId]: numericValue,
    }));
  };

  const handleSaveResults = async () => {
    try {
      await saveAcademicResults({
        subject,
        scores,
        term: "First Term",
        academicYear: "2026/2027",
      });

      Alert.alert(
        "Success",
        "Academic results saved successfully."
      );

    } catch (error) {

      console.error(
        "Error saving academic results:",
        error
      );

      Alert.alert(
        "Error",
        error.message || "Unable to save results."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Academic Results
        </Text>

        <Text style={styles.subtitle}>
          Primary 5A • First Term
        </Text>
      </View>

      {/* SUBJECT */}

      <View style={styles.subjectContainer}>
        <Text style={styles.subjectLabel}>
          Subject
        </Text>

        <FlatList
          horizontal
          data={SUBJECTS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectList}
          renderItem={({ item }) => {
            const active = item === subject;

            return (
              <TouchableOpacity
                style={[
                  styles.subjectButton,
                  active &&
                    styles.subjectButtonActive,
                ]}
                onPress={() => setSubject(item)}
              >
                <Text
                  style={[
                    styles.subjectText,
                    active &&
                      styles.subjectTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <Text style={styles.instruction}>
        Enter scores out of 100.
      </Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.firstName.charAt(0)}
                {item.lastName.charAt(0)}
              </Text>
            </View>

            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {item.firstName} {item.lastName}
              </Text>

              <Text style={styles.scoreLabel}>
                Score
              </Text>
            </View>

            <TextInput
              value={scores[item.id] || ""}
              onChangeText={(value) =>
                updateScore(item.id, value)
              }
              keyboardType="numeric"
              maxLength={3}
              placeholder="0"
              placeholderTextColor={
                Colors.textMuted
              }
              style={styles.scoreInput}
            />
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.saveButton}
        activeOpacity={0.85}
        onPress={handleSaveResults}
      >
        <Ionicons
          name="save-outline"
          size={19}
          color={Colors.white}
        />

        <Text style={styles.saveText}>
          Save Results
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: Colors.textDark,
  },

  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 5,
  },

  subjectContainer: {
    marginBottom: 12,
  },

  subjectLabel: {
    paddingHorizontal: 20,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },

  subjectList: {
    paddingHorizontal: 20,
    gap: 8,
  },

  subjectButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  subjectButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  subjectText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  subjectTextActive: {
    color: Colors.white,
    fontWeight: "800",
  },

  instruction: {
    paddingHorizontal: 20,
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 10,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  studentCard: {
    minHeight: 70,
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 12,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  avatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.primary,
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },

  scoreLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 3,
  },

  scoreInput: {
    width: 55,
    height: 42,
    borderRadius: 11,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
    color: Colors.primary,
  },

  saveButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 52,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
});