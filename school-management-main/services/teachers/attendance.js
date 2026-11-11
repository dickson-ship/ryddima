import { db } from "../firebase";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { getTeacherData } from "./student";


// ========================================
// SAVE ATTENDANCE
// ========================================

export const saveAttendance = async (attendance) => {
  const teacherData = await getTeacherData();

  if (!teacherData) {
    throw new Error("Teacher is not authenticated.");
  }

  if (!attendance || attendance.length === 0) {
    throw new Error("No attendance data to save.");
  }

  const today = new Date();
  const date = today.toISOString().split("T")[0];


  // ========================================
  // Calculate today's class attendance
  // ========================================

  const presentCount = attendance.filter(
    (student) => student.status === "present"
  ).length;

  const lateCount = attendance.filter(
    (student) => student.status === "late"
  ).length;

  const absentCount = attendance.filter(
    (student) => student.status === "absent"
  ).length;


  // ========================================
  // Save each student's attendance
  // ========================================

  for (const student of attendance) {

    if (!student.status) {
      continue;
    }


    // ----------------------------------------
    // 1. Attendance document
    // ----------------------------------------

    const attendanceRef = doc(
      db,
      "attendance",
      student.id,
      "records",
      date
    );


    await setDoc(
      attendanceRef,
      {
        studentId: student.id,

        // Individual student's status
        status: student.status,

        // Today's class totals
        present: presentCount,
        late: lateCount,
        absent: absentCount,

        date: date,

        classId: teacherData.classId || null,
        className: teacherData.className || null,

        markedBy: teacherData.uid,
        teacherName: teacherData.name || null,

        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );


    // ----------------------------------------
    // 2. Get all attendance records
    //    for this student
    // ----------------------------------------

    const recordsRef = collection(
      db,
      "attendance",
      student.id,
      "records"
    );

    const recordsSnapshot = await getDocs(
      recordsRef
    );


    // ----------------------------------------
    // 3. Count this student's attendance
    // ----------------------------------------

    let studentPresentCount = 0;
    let studentLateCount = 0;
    let studentAbsentCount = 0;


    recordsSnapshot.forEach((recordDoc) => {

      const record = recordDoc.data();

      if (record.status === "present") {
        studentPresentCount++;
      }

      if (record.status === "late") {
        studentLateCount++;
      }

      if (record.status === "absent") {
        studentAbsentCount++;
      }

    });


    // ----------------------------------------
    // 4. Update student's stats
    // ----------------------------------------

    const studentRef = doc(
      db,
      "students",
      student.id
    );


    await updateDoc(
      studentRef,
      {
        "stats.attendance": studentPresentCount,

        updatedAt: serverTimestamp(),
      }
    );
  }

  return true;
};


// ========================================
// FETCH TODAY'S ATTENDANCE
// ========================================

export const fetchAttendance = async () => {

  const teacherData = await getTeacherData();

  if (!teacherData) {
    return {};
  }


  const studentsQuery = query(
    collection(db, "students"),
    where(
      "className",
      "==",
      teacherData.className
    )
  );


  const studentsSnapshot = await getDocs(
    studentsQuery
  );


  const attendance = {};


  const today = new Date()
    .toISOString()
    .split("T")[0];


  for (
    const studentDoc of studentsSnapshot.docs
  ) {

    const attendanceRef = doc(
      db,
      "attendance",
      studentDoc.id,
      "records",
      today
    );


    const attendanceDoc = await getDoc(
      attendanceRef
    );


    if (attendanceDoc.exists()) {

      attendance[studentDoc.id] =
        attendanceDoc.data().status;

    }

  }

  return attendance;
};