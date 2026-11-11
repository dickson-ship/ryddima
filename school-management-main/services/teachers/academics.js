import { db } from "../firebase";

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { getTeacherData } from "./student";


/**
 * Convert subject name to a safe Firestore document ID
 *
 * Mathematics -> Mathematics
 * English Language -> English_Language
 */
const createSubjectId = (subject) => {
  return subject
    .trim()
    .replace(/\s+/g, "_");
};


/**
 * Save academic results
 *
 * Firestore:
 *
 * results/{studentId}/subjects/{subjectId}
 */
export const saveAcademicResults = async ({
  subject,
  scores,
  term = "First Term",
  academicYear = "2026/2027",
}) => {

  if (!subject) {
    throw new Error("Subject is required.");
  }

  if (!scores || Object.keys(scores).length === 0) {
    throw new Error("No scores to save.");
  }


  const teacherData = await getTeacherData();

  if (!teacherData) {
    throw new Error("Teacher is not authenticated.");
  }


  const subjectId = createSubjectId(subject);


  for (const studentId of Object.keys(scores)) {

    const score = scores[studentId];


    // Ignore students with no score
    if (
      score === "" ||
      score === null ||
      score === undefined
    ) {
      continue;
    }


    const numericScore = Number(score);


    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      throw new Error(
        `Invalid score for student ${studentId}.`
      );
    }


    const resultRef = doc(
      db,
      "results",
      studentId,
      "subjects",
      subjectId
    );


    await setDoc(
      resultRef,
      {
        studentId,

        subject,

        score: numericScore,

        term,

        academicYear,

        classId:
          teacherData.classId || null,

        className:
          teacherData.className || null,

        markedBy:
          teacherData.uid,

        teacherName:
          teacherData.name || null,

        updatedAt:
          serverTimestamp(),
      },
      {
        merge: true,
      }
    );
  }


  return true;
};


/**
 * Fetch all academic results for one student
 */
export const fetchStudentAcademicResults = async (
  studentId
) => {

  if (!studentId) {
    throw new Error("Student ID is required.");
  }


  const resultsRef = collection(
    db,
    "results",
    studentId,
    "subjects"
  );


  const snapshot = await getDocs(
    resultsRef
  );


  return snapshot.docs.map(
    (resultDoc) => ({
      id: resultDoc.id,
      ...resultDoc.data(),
    })
  );
};


/**
 * Fetch one student's result for one subject
 */
export const fetchStudentSubjectResult = async (
  studentId,
  subject
) => {

  if (!studentId) {
    throw new Error("Student ID is required.");
  }

  if (!subject) {
    throw new Error("Subject is required.");
  }


  const subjectId =
    createSubjectId(subject);


  const resultRef = doc(
    db,
    "results",
    studentId,
    "subjects",
    subjectId
  );


  const snapshot = await getDoc(
    resultRef
  );


  if (!snapshot.exists()) {
    return null;
  }


  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};