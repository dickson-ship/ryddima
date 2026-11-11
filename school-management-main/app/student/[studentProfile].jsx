import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/colors";
import { Stat, OverviewTab,AttendanceTab, FeesTab } from "@/components/adminComponents/studentProfile";
import { AcademicsTab } from "@/components/adminComponents/AcademicsTabs";

import { db } from "@/services/firebase";
import { getDocs, collection} from "firebase/firestore";



const TABS = [
  {
    id: "overview",
    label: "Overview",
    icon: "person-outline",
  },
  {
    id: "academics",
    label: "Academics",
    icon: "book-outline",
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: "calendar-outline",
  },
  {
    id: "fees",
    label: "Fees",
    icon: "wallet-outline",
  },
];

export default function StudentProfileScreen() {
  const {
    id,
    firstName,
    lastName,
    className,
    gender,
    status,
    admissionNumber,
    admissionDate,
    dateOfBirth,
    otherName,
    parent: parentParam,
    stats: statsParam,
  } = useLocalSearchParams();

  const parent = parentParam
    ? JSON.parse(parentParam)
    : null;

  const stats = statsParam
    ? JSON.parse(statsParam)
    : null;

  const [activeTab, setActiveTab] = useState("overview");
  const [attendance, setAttendance] = useState(null);
  
  const fetchStudentAttendance = async () => {
    try {
      if (!id) {
        return;
      }

      const attendanceRef = collection(
        db,
        "attendance",
        id,
        "records"
      );

      const snapshot = await getDocs(attendanceRef);

      const records = snapshot.docs.map((attendanceDoc) => ({
        id: attendanceDoc.id,
        ...attendanceDoc.data(),
      }));

      setAttendance(records);

    } catch (error) {
      console.error(
        "Error fetching student attendance:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load attendance records."
      );
    }
  };

  useEffect(() => {
    fetchStudentAttendance();
  }, [id]);



  const handleEdit = () => {
    router.push({
      pathname: "/edit-student",
      params: {
        id,
      },
    });
  };

  const handleCallParent = () => {
    Alert.alert(
      "Parent Contact",
      `Contact ${parent.name} at ${parent.phone}`
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "academics":
        return <AcademicsTab id={id} />;

      case "attendance":
        return <AttendanceTab attendance={attendance} />;

      case "fees":
        return <FeesTab />;

      default:
        return (
          <OverviewTab
            parent={parent}
            firstName={firstName}
            otherName={otherName}
            lastName={lastName}
            gender={gender}
            dateOfBirth={dateOfBirth}
            admissionNumber={admissionNumber}
            className={className}
            admissionDate={admissionDate}
            status={status}
            onCallParent={handleCallParent}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={Colors.text}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Student Profile
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleEdit}
          hitSlop={10}
        >
          <Ionicons
            name="create-outline"
            size={21}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* STUDENT HEADER */}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstName.charAt(0)}
              {lastName.charAt(0)}
            </Text>
          </View>

          <Text style={styles.studentName}>
            {firstName} {otherName}{" "}
            {lastName}
          </Text>

          <Text style={styles.admissionNumber}>
            {admissionNumber}
          </Text>

          <View style={styles.profileMeta}>
            <View style={styles.classBadge}>
              <Ionicons
                name="school-outline"
                size={13}
                color={Colors.primary}
              />

              <Text style={styles.classText}>
                {className}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                {status}
              </Text>
            </View>
          </View>
        </View>

        {/* QUICK STATS */}

        <View style={styles.statsContainer}>
          <Stat
            icon="calendar-outline"
            label="Attendance"
            value={`${stats.attendance || 0}%`}
          />

          <Stat
            icon="school-outline"
            label="Average"
            value={`${stats.academicAverage || 0}%`}
          />

          <Stat
            icon="wallet-outline"
            label="Balance"
            value={`GH₵ ${stats.feeBalance || 0}`}
          />
        </View>

        {/* TABS */}

        <View style={styles.tabsContainer}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  active && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon}
                  size={17}
                  color={
                    active
                      ? Colors.primary
                      : Colors.textMuted
                  }
                />

                <Text
                  style={[
                    styles.tabText,
                    active && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>


        {renderContent()}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    height: 62,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textDark,
  },

  /* PROFILE */

  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 25,
    fontWeight: "800",
    color: Colors.primary,
  },

  studentName: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textDark,
    textAlign: "center",
  },

  admissionNumber: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 5,
  },

  profileMeta: {
    flexDirection: "row",
    marginTop: 14,
    gap: 8,
  },

  classBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },

  classText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.success,
  },

   /* STATS */

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 20,
  },

  statCard: {
    width: "32%",
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingVertical: 13,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  statLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginBottom: 3,
  },

  statValue: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },

   /* TABS */

  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },

  activeTab: {
    backgroundColor: Colors.primaryLight,
  },

  tabText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textMuted,
  },

  activeTabText: {
    color: Colors.primary,
    fontWeight: "800",
  },

});