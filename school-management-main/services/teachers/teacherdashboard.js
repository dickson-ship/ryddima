import { db, auth } from "../firebase";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";


/**
 * Get the currently authenticated teacher
 */
export const fetchTeacherData = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Teacher is not authenticated.");
    }

    const teacherRef = doc(
      db,
      "users",
      user.uid
    );

    const teacherSnapshot =
      await getDoc(teacherRef);

    if (!teacherSnapshot.exists()) {
      throw new Error(
        "Teacher profile was not found."
      );
    }

    return {
      uid: user.uid,
      id: teacherSnapshot.id,
      ...teacherSnapshot.data(),
    };

  } catch (error) {

    console.error(
      "Error fetching teacher data:",
      error
    );

    throw error;
  }
};


/**
 * Get students assigned to the teacher's class
 */
export const fetchTeacherStudents = async (
  className
) => {

  if (!className) {
    throw new Error(
      "Teacher class is required."
    );
  }

  try {

    const studentsQuery = query(
      collection(db, "students"),
      where(
        "className",
        "==",
        className
      )
    );


    const snapshot =
      await getDocs(studentsQuery);


    return snapshot.docs.map(
      (studentDoc) => ({
        id: studentDoc.id,
        ...studentDoc.data(),
      })
    );

  } catch (error) {

    console.error(
      "Error fetching teacher students:",
      error
    );

    throw error;
  }
};


/**
 * Get today's date
 *
 * Format:
 * 2026-09-02
 */
const getToday = () => {

  return new Date()
    .toISOString()
    .split("T")[0];

};


/**
 * Fetch today's attendance for
 * students in the teacher's class
 */
export const fetchTeacherAttendance = async (
  students
) => {

  if (!students || students.length === 0) {
    return {};
  }


  try {

    const today = getToday();

    const attendance = {};


    for (const student of students) {

      const attendanceRef = doc(
        db,
        "attendance",
        student.id,
        "records",
        today
      );


      const snapshot =
        await getDoc(attendanceRef);


      if (snapshot.exists()) {

        attendance[student.id] =
          snapshot.data();

      } else {

        attendance[student.id] = null;

      }

    }


    return attendance;

  } catch (error) {

    console.error(
      "Error fetching teacher attendance:",
      error
    );

    throw error;
  }
};


/**
 * Fetch academic results for all
 * students in the teacher's class
 */
export const fetchTeacherAcademicResults = async (
  students
) => {

  if (!students || students.length === 0) {
    return {};
  }


  try {

    const results = {};


    for (const student of students) {

      const resultsRef = collection(
        db,
        "results",
        student.id,
        "subjects"
      );


      const snapshot =
        await getDocs(resultsRef);


      results[student.id] =
        snapshot.docs.map(
          (resultDoc) => ({
            id: resultDoc.id,
            ...resultDoc.data(),
          })
        );

    }


    return results;

  } catch (error) {

    console.error(
      "Error fetching teacher academic results:",
      error
    );

    throw error;
  }
};


/**
 * Calculate today's attendance statistics
 */
export const calculateAttendanceStats = (
  students,
  attendance
) => {

  const stats = {
    students: students.length,
    present: 0,
    absent: 0,
    late: 0,
  };


  students.forEach((student) => {

    const record =
      attendance[student.id];


    if (!record) {
      return;
    }


    if (record.status === "present") {
      stats.present++;
    }

    else if (record.status === "absent") {
      stats.absent++;
    }

    else if (record.status === "late") {
      stats.late++;
    }

  });


  return stats;
};


/**
 * Calculate class academic average
 */
export const calculateClassAverage = (
  academicResults
) => {

  const scores = [];


  Object.values(
    academicResults
  ).forEach((studentResults) => {

    studentResults.forEach((result) => {

      if (
        result.score !== undefined &&
        result.score !== null
      ) {

        const score =
          Number(result.score);


        if (
          !Number.isNaN(score)
        ) {
          scores.push(score);
        }

      }

    });

  });


  if (scores.length === 0) {
    return 0;
  }


  const total = scores.reduce(
    (sum, score) =>
      sum + score,
    0
  );


  return Math.round(
    total / scores.length
  );
};


/**
 * Main dashboard function
 *
 * Gets everything needed by
 * TeacherHomeScreen.
 */
export const fetchTeacherDashboard = async () => {

  try {

    /*
     * 1. Get teacher
     */
    const teacher =
      await fetchTeacherData();


    /*
     * 2. Get students in teacher's class
     */
    const students =
      await fetchTeacherStudents(
        teacher.className
      );


    /*
     * 3. Get today's attendance
     */
    const attendance =
      await fetchTeacherAttendance(
        students
      );


    /*
     * 4. Get academic results
     */
    const academicResults =
      await fetchTeacherAcademicResults(
        students
      );


    /*
     * 5. Calculate attendance statistics
     */
    const attendanceStats =
      calculateAttendanceStats(
        students,
        attendance
      );


    /*
     * 6. Calculate academic average
     */
    const average =
      calculateClassAverage(
        academicResults
      );


    return {

      teacher,

      students,

      attendance,

      academicResults,

      stats: {

        ...attendanceStats,

        average,

      },

    };

  } catch (error) {

    console.error(
      "Error fetching teacher dashboard:",
      error
    );

    throw error;
  }
};