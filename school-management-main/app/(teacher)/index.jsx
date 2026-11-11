import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Colors } from "@/constants/colors";

import {
  fetchTeacherDashboard,
} from "@/services/teachers/teacherdashboard";



const QUICK_ACTIONS = [
  {
    id: "attendance",
    title: "Take Attendance",
    icon: "calendar-outline",
    route: "/(teacher)/attendance",
  },
  {
    id: "academics",
    title: "Enter Results",
    icon: "book-outline",
    route: "/(teacher)/academics",
  },
  {
    id: "students",
    title: "View Students",
    icon: "people-outline",
    route: "/(teacher)/students",
  },
];

export default function TeacherHomeScreen() {

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  /**
   * Load dashboard data
   */
  useEffect(() => {

    loadDashboard();

  }, []);


  const loadDashboard = async () => {

    try {

      setLoading(true);


      const data =
        await fetchTeacherDashboard();


      setDashboard(data);

    } catch (error) {

      console.error(
        "Error loading teacher dashboard:",
        error
      );


      Alert.alert(
        "Error",
        "Unable to load teacher dashboard."
      );

    } finally {

      setLoading(false);

    }

  };


  /**
   * Greeting
   */
  const greeting = useMemo(() => {

    const hour =
      new Date().getHours();


    if (hour < 12) {
      return "Good morning";
    }


    if (hour < 17) {
      return "Good afternoon";
    }


    return "Good evening";

  }, []);


  /**
   * Loading screen
   */
  if (loading) {

    return (

      <SafeAreaView
        style={styles.container}
      >

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >

          <ActivityIndicator
            size="large"
            color={Colors.primary}
          />

          <Text
            style={{
              marginTop: 12,
              color: Colors.textSecondary,
            }}
          >
            Loading dashboard...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  /**
   * No dashboard data
   */
  if (!dashboard) {

    return (

      <SafeAreaView
        style={styles.container}
      >

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >

          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: Colors.text,
            }}
          >
            Unable to load dashboard
          </Text>


          <TouchableOpacity
            style={{
              marginTop: 15,
              backgroundColor:
                Colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 10,
            }}
            onPress={loadDashboard}
          >

            <Text
              style={{
                color: Colors.white,
                fontWeight: "700",
              }}
            >
              Try Again
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>

    );

  }


  const {
    teacher,
    stats,
  } = dashboard;


  return (

    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <View
            style={styles.headerText}
          >

            <Text
              style={styles.greeting}
            >

              {greeting},{" "}
              {teacher.firstName}

            </Text>


            <Text
              style={styles.subtitle}
            >
              Here's what's happening in
              your class.
            </Text>

          </View>


          <TouchableOpacity
            style={
              styles.notificationButton
            }
            activeOpacity={0.8}
          >

            <Ionicons
              name="notifications-outline"
              size={22}
              color={Colors.text}
            />

            <View
              style={styles.notificationDot}
            />

          </TouchableOpacity>

        </View>


        {/* CLASS CARD */}

        <View style={styles.classCard}>

          <View style={styles.classIcon}>

            <Ionicons
              name="school-outline"
              size={24}
              color={Colors.white}
            />

          </View>


          <View style={styles.classInfo}>

            <Text
              style={styles.classLabel}
            >
              MY CLASS
            </Text>


            <Text
              style={styles.className}
            >
              {teacher.className}
            </Text>


            <Text
              style={styles.classDescription}
            >
              {stats.students} students
              assigned
            </Text>

          </View>


          <TouchableOpacity
            style={styles.classArrow}
            onPress={() =>
              router.push(
                "/(teacher)/students"
              )
            }
            activeOpacity={0.8}
          >

            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.white}
            />

          </TouchableOpacity>

        </View>


        {/* TODAY */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Today's Overview
          </Text>

        </View>


        <View style={styles.statsGrid}>

          <TeacherStat
            icon="people-outline"
            label="Students"
            value={stats.students}
          />


          <TeacherStat
            icon="checkmark-circle-outline"
            label="Present"
            value={stats.present}
            valueColor={
              Colors.success
            }
          />


          <TeacherStat
            icon="close-circle-outline"
            label="Absent"
            value={stats.absent}
            valueColor={
              Colors.danger
            }
          />


          <TeacherStat
            icon="time-outline"
            label="Late"
            value={stats.late}
            valueColor={
              Colors.warning
            }
          />

        </View>


        {/* QUICK ACTIONS */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Quick Actions
          </Text>

        </View>


        <View
          style={styles.actionsContainer}
        >

          {QUICK_ACTIONS.map(
            (action) => (

              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() =>
                  router.push(
                    action.route
                  )
                }
                activeOpacity={0.8}
              >

                <View
                  style={styles.actionIcon}
                >

                  <Ionicons
                    name={action.icon}
                    size={21}
                    color={Colors.primary}
                  />

                </View>


                <Text
                  style={styles.actionTitle}
                >
                  {action.title}
                </Text>


                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />

              </TouchableOpacity>

            )
          )}

        </View>


        {/* ACADEMIC PERFORMANCE */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Class Performance
          </Text>


          <TouchableOpacity
            onPress={() =>
              router.push(
                "/(teacher)/academics"
              )
            }
          >

            <Text
              style={styles.viewAll}
            >
              View
            </Text>

          </TouchableOpacity>

        </View>


        <View
          style={styles.performanceCard}
        >

          <View>

            <Text
              style={styles.performanceLabel}
            >
              Class Average
            </Text>


            <Text
              style={styles.performanceValue}
            >
              {stats.average}%
            </Text>

          </View>


          <View
            style={styles.performanceIcon}
          >

            <Ionicons
              name="trending-up-outline"
              size={25}
              color={Colors.primary}
            />

          </View>

        </View>


        {/* ANNOUNCEMENT */}

        <View
          style={styles.sectionHeader}
        >

          <Text
            style={styles.sectionTitle}
          >
            Recent Announcement
          </Text>

        </View>


        <View
          style={styles.announcementCard}
        >

          <View
            style={styles.announcementIcon}
          >

            <Ionicons
              name="megaphone-outline"
              size={20}
              color={Colors.primary}
            />

          </View>


          <View
            style={styles.announcementContent}
          >

            <Text
              style={styles.announcementTitle}
            >
              Staff Meeting
            </Text>


            <Text
              style={styles.announcementText}
              numberOfLines={2}
            >
              There will be a staff meeting
              on Friday at 3:00 PM.
            </Text>


            <Text
              style={styles.announcementDate}
            >
              Today
            </Text>

          </View>

        </View>


        <View
          style={styles.bottomSpace}
        />

      </ScrollView>

    </SafeAreaView>

  );
}

function TeacherStat({
  icon,
  label,
  value,
  valueColor,
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={Colors.primary}
        />
      </View>

      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.statValue,
          valueColor && {
            color: valueColor,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  headerText: {
    flex: 1,
  },

  greeting: {
    fontSize: 25,
    fontWeight: "800",
    color: Colors.textDark,
  },

  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 5,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    right: 10,
    top: 9,
  },

  classCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: Colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  classInfo: {
    flex: 1,
  },

  classLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.primaryLight,
    letterSpacing: 1,
  },

  className: {
    fontSize: 19,
    fontWeight: "800",
    color: Colors.white,
    marginTop: 3,
  },

  classDescription: {
    fontSize: 11,
    color: Colors.primaryLight,
    marginTop: 3,
  },

  classArrow: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },

  viewAll: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 23,
  },

  statCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
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
    marginBottom: 9,
  },

  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textDark,
    marginTop: 2,
  },

  actionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 23,
  },

  actionCard: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  actionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },

  performanceCard: {
    backgroundColor: Colors.white,
    borderRadius: 17,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 23,
  },

  performanceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  performanceValue: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.textDark,
    marginTop: 3,
  },

  performanceIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  announcementCard: {
    backgroundColor: Colors.white,
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  announcementIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  announcementContent: {
    flex: 1,
  },

  announcementTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },

  announcementText: {
    fontSize: 11,
    lineHeight: 17,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  announcementDate: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 6,
  },

  bottomSpace: {
    height: 35,
  },
});