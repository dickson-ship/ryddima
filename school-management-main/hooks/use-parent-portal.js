import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { fetchParentChildren } from '@/services/parent/children';

export function useParentPortal(requestedStudentId) {
  const [profile, setProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Your session has expired. Please sign in again.');
      const profileSnap = await getDoc(doc(db, 'users', user.uid));
      if (!profileSnap.exists() || profileSnap.data().role !== 'parent') {
        throw new Error('Your parent profile could not be verified. Contact the school administrator.');
      }
      const linkedChildren = await fetchParentChildren(user.uid);
      setProfile({ uid: user.uid, ...profileSnap.data() });
      setChildren(linkedChildren);
    } catch (err) {
      console.error('Parent portal load error:', err);
      setError(err?.message || 'Unable to load parent information.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const requestedId = Array.isArray(requestedStudentId) ? requestedStudentId[0] : requestedStudentId;
  const selectedChild = children.find((child) => child.id === requestedId) || children[0] || null;

  return { profile, children, selectedChild, loading, refreshing, error, reload: load };
}
