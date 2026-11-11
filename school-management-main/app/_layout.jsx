import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, db } from '@/services/firebase';
import { Colors } from '@/constants/colors';

const roleHome = { parent: '/(parent)', teacher: '/(teacher)', admin: '/(admin)' };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!active) return;
      setFirebaseUser(nextUser);
      setProfile(null);
      if (!nextUser) {
        setAuthReady(true);
        return;
      }
      try {
        const snapshot = await getDoc(doc(db, 'users', nextUser.uid));
        if (active && snapshot.exists()) setProfile({ uid: nextUser.uid, ...snapshot.data() });
      } catch (error) {
        console.error('Could not load signed-in user profile:', error);
      } finally {
        if (active) setAuthReady(true);
      }
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  if (!authReady) {
    return <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={Colors.primary} /></View><StatusBar style="auto" /></ThemeProvider>;
  }

  const inAuthGroup = segments[0] === '(auth)' || segments.length === 0;
  if (!firebaseUser && !inAuthGroup) return <Redirect href="/(auth)" />;
  if (firebaseUser && inAuthGroup && roleHome[profile?.role]) return <Redirect href={roleHome[profile.role]} />;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
        <Stack.Screen name="(parent)" options={{ headerShown: false }} />
        <Stack.Screen name="add-student" options={{ presentation: 'modal', title: 'Add Student' }} />
        <Stack.Screen name="link-parent" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
