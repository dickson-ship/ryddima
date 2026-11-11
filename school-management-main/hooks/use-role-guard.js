import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';

export function useRoleGuard(expectedRole) {
  const [state, setState] = useState({ loading: true, user: null, profile: null, allowed: false });
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;
      if (!user) {
        setState({ loading: false, user: null, profile: null, allowed: false });
        return;
      }
      try {
        const snapshot = await getDoc(doc(db, 'users', user.uid));
        const profile = snapshot.exists() ? { uid: user.uid, ...snapshot.data() } : null;
        if (active) setState({ loading: false, user, profile, allowed: profile?.role === expectedRole });
      } catch (error) {
        console.error('Role verification failed:', error);
        if (active) setState({ loading: false, user, profile: null, allowed: false });
      }
    });
    return () => { active = false; unsubscribe(); };
  }, [expectedRole]);
  return state;
}
