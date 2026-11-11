import { auth, db } from '../firebase';
import { doc, getDoc, query, collection, where, getDocs, collectionGroup } from 'firebase/firestore';

export async function getAdminData() {
  const user = auth.currentUser;
  if (!user) return null;
  const snapshot = await getDoc(doc(db, 'users', user.uid));
  if (!snapshot.exists()) return null;
  return { uid: user.uid, ...snapshot.data() };
}

export async function getTeacherData() {
  const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'teacher')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getParentData() {
  const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'parent')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

async function fetchAttendanceByStatus(status) {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const q = query(collectionGroup(db, 'records'), where('status', '==', status), where('date', '==', date));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export const fetchTodayPresentAttendance = () => fetchAttendanceByStatus('present');
export const fetchTodayAbsentAttendance = () => fetchAttendanceByStatus('absent');
export const fetchTodayLateAttendance = () => fetchAttendanceByStatus('late');
