import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export async function fetchParentChildren(parentUid) {
  if (!parentUid) return [];

  const [studentsResult, linksResult] = await Promise.allSettled([
    getDocs(query(collection(db, 'students'), where('parentUid', '==', parentUid))),
    getDocs(query(collection(db, 'parentStudentLinks'), where('parentUid', '==', parentUid))),
  ]);

  if (studentsResult.status === 'rejected' && linksResult.status === 'rejected') {
    console.error('Both parent-child queries failed:', studentsResult.reason, linksResult.reason);
    throw new Error('Could not load linked students. Check your connection and Firestore rules.');
  }

  const children = new Map();
  if (studentsResult.status === 'fulfilled') {
    studentsResult.value.docs.forEach((studentDoc) => {
      children.set(studentDoc.id, { id: studentDoc.id, ...studentDoc.data() });
    });
  }

  if (linksResult.status === 'fulfilled') {
    await Promise.all(linksResult.value.docs.map(async (linkDoc) => {
      const studentId = linkDoc.data().studentId;
      if (!studentId || children.has(studentId)) return;
      try {
        const studentSnapshot = await getDoc(doc(db, 'students', studentId));
        if (studentSnapshot.exists() && studentSnapshot.data().parentUid === parentUid) {
          children.set(studentSnapshot.id, { id: studentSnapshot.id, ...studentSnapshot.data() });
        }
      } catch (error) {
        console.error(`Unable to read linked student ${studentId}:`, error);
      }
    }));
  }

  return [...children.values()].sort((a, b) => {
    const aName = `${a.firstName || ''} ${a.lastName || ''}`.trim();
    const bName = `${b.firstName || ''} ${b.lastName || ''}`.trim();
    return aName.localeCompare(bName);
  });
}
