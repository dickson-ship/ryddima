import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";

import { Colors } from "@/constants/colors";
import { auth } from "@/services/firebase";
import {
  fetchStudents,
  getTeacherData,
} from "@/services/teachers/student";

export default function TeacherStudentsScreen() {
  const [students, setStudents] = useState([]);
  const [teacherData, setTeacherData] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setTeacherData(null);
        setStudents([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get teacher information
        const teacher = await getTeacherData();

        if (!teacher) {
          setTeacherData(null);
          setStudents([]);
          return;
        }

        setTeacherData(teacher);

        // Get students belonging to teacher's class
        const data = await fetchStudents();

        setStudents(data || []);
      } catch (error) {
        console.error("Error loading teacher students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((student) => {
      const name = `${student.firstName || ""} ${
        student.lastName || ""
      }`.toLowerCase();

      const admissionNumber = (
        student.admissionNumber || ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        admissionNumber.includes(query)
      );
    });
  }, [students, search]);

  const renderStudent = ({ item }) => (
    <TouchableOpacity
      style={styles.studentCard}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/teacherStudent/[id]",
          params: {
            id: item.id,
          },
        })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.firstName?.charAt(0)}
          {item.lastName?.charAt(0)}
        </Text>
      </View>

      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>
          {item.firstName} {item.lastName}
        </Text>

        <Text style={styles.admissionNumber}>
          {item.admissionNumber}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color={Colors.textMuted}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            My Students
          </Text>

          <Text style={styles.subtitle}>
            {teacherData?.className || "Loading class..."} •{" "}
            {filteredStudents.length} students
          </Text>
        </View>
      </View>

      {/* SEARCH */}

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={19}
          color={Colors.textMuted}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search students"
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch("")}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* STUDENTS */}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
          />

          <Text style={styles.loadingText}>
            Loading students...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudent}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="people-outline"
                size={42}
                color={Colors.textMuted}
              />

              <Text style={styles.emptyTitle}>
                No students found
              </Text>

              <Text style={styles.emptyText}>
                {search
                  ? "Try searching using another name."
                  : "There are no students assigned to your class."}
              </Text>
            </View>
          }
        />
      )}
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
    paddingBottom: 18,
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

  searchContainer: {
    height: 49,
    marginHorizontal: 20,
    marginBottom: 17,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: Colors.text,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  studentCard: {
    minHeight: 72,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 13,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primary,
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },

  admissionNumber: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  empty: {
    alignItems: "center",
    paddingTop: 80,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 12,
  },

  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 5,
    textAlign: "center",
    paddingHorizontal: 30,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.textSecondary,
  },
});