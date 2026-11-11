import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

const USERS = 'users';
const STUDENTS = 'students';
const LINKS = 'parentStudentLinks';

export const createLinkId = (parentUid, studentId) => `${parentUid}__${studentId}`;

/** Search registered parent profiles. Empty search returns every parent. */
export async function searchParentAccounts(searchTerm = '') {
  const parentsQuery = query(collection(db, USERS), where('role', '==', 'parent'));
  const snapshot = await getDocs(parentsQuery);
  const parents = snapshot.docs.map((parentDoc) => {
    const data = parentDoc.data();
    const name = data.name || data.fullName || data.displayName ||
      [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Parent account';
    return {
      ...data,
      uid: parentDoc.id,
      name,
      email: data.email || data.emailLowercase || '',
      emailLowercase: (data.emailLowercase || data.email || '').toLowerCase(),
      role: data.role,
    };
  });

  const term = String(searchTerm || '').trim().toLowerCase();
  if (!term) return parents.sort((a, b) => a.name.localeCompare(b.name));
  return parents
    .filter((parent) => parent.name.toLowerCase().includes(term) || parent.emailLowercase.includes(term))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Create or replace the single primary parent link for a student. */
export async function linkParentToStudent({ studentId, parentUid, linkedBy }) {
  if (!studentId || !parentUid || !linkedBy) {
    throw new Error('Student, parent, and administrator IDs are required.');
  }

  const studentRef = doc(db, STUDENTS, studentId);
  const parentRef = doc(db, USERS, parentUid);
  const newLinkRef = doc(db, LINKS, createLinkId(parentUid, studentId));

  return runTransaction(db, async (transaction) => {
    const [studentSnapshot, parentSnapshot] = await Promise.all([
      transaction.get(studentRef),
      transaction.get(parentRef),
    ]);

    if (!studentSnapshot.exists()) throw new Error('The selected student no longer exists.');
    if (!parentSnapshot.exists()) throw new Error('The selected parent account no longer exists.');

    const parentData = parentSnapshot.data();
    if (parentData.role !== 'parent') {
      throw new Error('Only registered parent accounts can be linked to students.');
    }

    const studentData = studentSnapshot.data();
    const previousParentUid = studentData.parentUid || null;
    const parentName = parentData.name || parentData.fullName || parentData.displayName ||
      [parentData.firstName, parentData.lastName].filter(Boolean).join(' ') || 'Parent account';
    const parentEmail = parentData.email || parentData.emailLowercase || '';

    if (previousParentUid && previousParentUid !== parentUid) {
      const oldLinkRef = doc(db, LINKS, createLinkId(previousParentUid, studentId));
      transaction.delete(oldLinkRef);
    }

    transaction.update(studentRef, {
      parentUid,
      parent: {
        ...(studentData.parent || {}),
        name: parentName,
        email: parentEmail,
        phone: parentData.phone || studentData.parent?.phone || '',
      },
      updatedAt: serverTimestamp(),
    });

    transaction.set(newLinkRef, {
      parentUid,
      studentId,
      parentName,
      parentEmail,
      linkedBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { studentId, parentUid, previousParentUid };
  });
}

export async function unlinkParentFromStudent({ studentId, unlinkedBy }) {
  if (!studentId || !unlinkedBy) throw new Error('Student and administrator IDs are required.');
  const studentRef = doc(db, STUDENTS, studentId);

  return runTransaction(db, async (transaction) => {
    const studentSnapshot = await transaction.get(studentRef);
    if (!studentSnapshot.exists()) throw new Error('The selected student no longer exists.');

    const studentData = studentSnapshot.data();
    const parentUid = studentData.parentUid;
    if (!parentUid) return { studentId, parentUid: null };

    const linkRef = doc(db, LINKS, createLinkId(parentUid, studentId));
    transaction.update(studentRef, {
      parentUid: null,
      parent: {
        ...(studentData.parent || {}),
        linkedAccount: false,
      },
      updatedAt: serverTimestamp(),
      lastParentUnlinkedBy: unlinkedBy,
    });
    transaction.delete(linkRef);
    return { studentId, parentUid };
  });
}
