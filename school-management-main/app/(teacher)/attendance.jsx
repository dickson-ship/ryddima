import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/colors";
import { fetchStudents } from "../../services/teachers/student";
import { saveAttendance, fetchAttendance } from "../../services/teachers/attendance";



export default function TeacherAttendanceScreen() {
  const [students, setStudents] =useState([]);

  useEffect(() => {
    fetchStudents().then((data) => {
      setStudents(data);
    });
  }, []);

  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    fetchAttendance().then((data) => {
      setAttendance(data);
    });
  }, []);

  const summary = useMemo(() => {
    return {
        present: students.filter(
        (student) =>
            attendance[student.id] === "present"
        ).length,

        absent: students.filter(
        (student) =>
            attendance[student.id] === "absent"
        ).length,

        late: students.filter(
        (student) =>
            attendance[student.id] === "late"
        ).length,
    };
    }, [students, attendance]);

  const updateStatus = (id, status) => {
    setAttendance((current) => ({
        ...current,
        [id]: status,
    }));
    };

  const renderStudent = ({ item }) => {
    return (
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
        </View>

        <View style={styles.statusButtons}>
          <StatusButton
            icon="checkmark"
            active={attendance[item.id] === "present"}
            color={Colors.success}
            onPress={() =>
                updateStatus(item.id, "present")
            }
            />

            <StatusButton
            icon="time-outline"
            active={attendance[item.id] === "late"}
            color={Colors.warning}
            onPress={() =>
                updateStatus(item.id, "late")
            }
            />

            <StatusButton
            icon="close"
            active={attendance[item.id] === "absent"}
            color={Colors.danger}
            onPress={() =>
                updateStatus(item.id, "absent")
            }
            />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Attendance
        </Text>

        <Text style={styles.date}>
          1 September 2026
        </Text>
      </View>

      {/* SUMMARY */}

      <View style={styles.summary}>
        <SummaryItem
          label="Present"
          value={summary.present}
          color={Colors.success}
        />

        <SummaryItem
          label="Late"
          value={summary.late}
          color={Colors.warning}
        />

        <SummaryItem
          label="Absent"
          value={summary.absent}
          color={Colors.danger}
        />
      </View>

      <Text style={styles.instruction}>
        Mark each student's attendance.
      </Text>

      <FlatList
        data={students}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={styles.saveButton}
        activeOpacity={0.85}
        onPress={async () => {
            try {
                await saveAttendance(
                students.map((student) => ({
                    id: student.id,
                    status: attendance[student.id],
                }))
                );

                alert("Attendance saved successfully.");
            } catch (error) {
                console.error("Error saving attendance:", error);

                alert("Failed to save attendance.");
            }
            }}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={20}
          color={Colors.white}
        />

        <Text style={styles.saveText}>
          Save Attendance
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function SummaryItem({
  label,
  value,
  color,
}) {
  return (
    <View style={styles.summaryItem}>
      <Text
        style={[
          styles.summaryValue,
          { color },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>
    </View>
  );
}

function StatusButton({
  icon,
  active,
  color,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.statusButton,
        active && {
          backgroundColor: color,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={16}
        color={
          active
            ? Colors.white
            : Colors.textMuted
        }
      />
    </TouchableOpacity>
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
    paddingBottom: 17,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: Colors.textDark,
  },

  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 5,
  },

  summary: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 17,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },

  summaryItem: {
    alignItems: "center",
  },

  summaryValue: {
    fontSize: 23,
    fontWeight: "800",
  },

  summaryLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  instruction: {
    paddingHorizontal: 20,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  studentCard: {
    minHeight: 67,
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
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
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

  statusButtons: {
    flexDirection: "row",
    gap: 5,
  },

  statusButton: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
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