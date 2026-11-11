import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

export const getTeacherData = async () => {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const teacherRef = doc(db, "users", user.uid);
  const teacherDoc = await getDoc(teacherRef);

  if (!teacherDoc.exists()) {
    return null;
  }

  return {
    uid: user.uid,
    ...teacherDoc.data(),
  };
};


export const fetchStudents = async () => {
  const teacherData = await getTeacherData();

  if (!teacherData) {
    return [];
  }

  const q = query(
    collection(db, "students"),
    where("className", "==", teacherData.className)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
};