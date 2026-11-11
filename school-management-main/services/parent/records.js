import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

export async function fetchParentAttendance(studentId) {
  if (!studentId) return [];
  const snapshot = await getDocs(collection(db, 'attendance', studentId, 'records'));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.date || b.id).localeCompare(String(a.date || a.id)));
}

export async function fetchParentResults(studentId) {
  if (!studentId) return [];
  const snapshot = await getDocs(collection(db, 'results', studentId, 'subjects'));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(a.subject || '').localeCompare(String(b.subject || '')));
}

export function formatSchoolDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
