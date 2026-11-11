import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";

import {
  fetchStudentAcademicResults,
} from "@/services/teachers/academics";
import { Colors } from "@/constants/colors";
import { ActionRow, Section, SubjectRow } from "./studentProfile";


export function AcademicsTab({ id }) {

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /**
   * Load student's academic results
   */
  useEffect(() => {

    if (!id) {
      setLoading(false);
      return;
    }

    loadResults();

  }, [id]);


  const loadResults = async () => {

    try {

      setLoading(true);

      const data =
        await fetchStudentAcademicResults(id);

      setResults(data);

    } catch (error) {

      console.error(
        "Error fetching academic results:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load academic results."
      );

    } finally {

      setLoading(false);

    }
  };


  /**
   * Calculate overall average
   */
  const overallAverage = useMemo(() => {

    if (results.length === 0) {
      return 0;
    }


    const total = results.reduce(
      (sum, result) =>
        sum + Number(result.score || 0),
      0
    );


    return Math.round(
      total / results.length
    );

  }, [results]);


  /**
   * Calculate grade
   */
  const grade = useMemo(() => {

    if (overallAverage >= 80) {
      return "A";
    }

    if (overallAverage >= 70) {
      return "B";
    }

    if (overallAverage >= 60) {
      return "C";
    }

    if (overallAverage >= 50) {
      return "D";
    }

    return "F";

  }, [overallAverage]);


  if (loading) {

    return (

      <View
        style={styles.loadingContainer}
      >

        <ActivityIndicator
          size="small"
        />

        <Text
          style={styles.loadingText}
        >
          Loading academic results...
        </Text>

      </View>

    );

  }

  return (

    <>
      <Section
        title="Academic Performance"
        icon="book-outline"
      >

        {/* OVERALL AVERAGE */}

        <View
          style={styles.averageContainer}
        >

          <View>

            <Text
              style={styles.averageLabel}
            >
              Overall Average
            </Text>


            <Text
              style={styles.averageValue}
            >
              {overallAverage}%
            </Text>

          </View>


          <View
            style={styles.gradeBadge}
          >

            <Text
              style={styles.gradeText}
            >
              {grade}
            </Text>

          </View>

        </View>


        {/* SUBJECT RESULTS */}

        {results.length === 0 ? (

          <Text
            style={styles.noResults}
          >
            No academic results have been
            entered for this student.
          </Text>

        ) : (

          results.map((result) => (

            <SubjectRow
              key={result.id}
              subject={result.subject}
              score={`${result.score}%`}
            />

          ))

        )}

      </Section>


      <Section
        title="Academic Actions"
        icon="options-outline"
      >

        <ActionRow
          icon="document-text-outline"
          title="View Report Card"
        />


        <ActionRow
          icon="create-outline"
          title="Enter Results"
        />

      </Section>

    </>

  );
}

const styles = StyleSheet.create({
  

  /* ACADEMICS */

  averageContainer: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  averageLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  averageValue: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textDark,
    marginTop: 3,
  },

  gradeBadge: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  gradeText: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
  },

  subjectRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  subjectName: {
    fontSize: 12,
    color: Colors.text,
  },

  subjectScore: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },

  actionRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },

  actionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },

  
});