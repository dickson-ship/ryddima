import { db } from "../firebase";
import { collection,getDocs,} from "firebase/firestore";

export const fetchStudents = async () => {

    const snapshot = await getDocs(
      collection(db, "students")
    );

    const studentData = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    return studentData;

};