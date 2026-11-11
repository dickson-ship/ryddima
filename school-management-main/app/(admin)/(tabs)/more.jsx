import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { Colors } from '@/constants/colors';

function SettingRow({ icon, title, description, onPress, danger = false }) {
  return <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}><View style={[styles.rowIcon, danger && styles.dangerIcon]}><Ionicons name={icon} size={21} color={danger ? Colors.danger : Colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.rowTitle, danger && { color: Colors.danger }]}>{title}</Text><Text style={styles.rowDescription}>{description}</Text></View><Ionicons name="chevron-forward" size={18} color={Colors.textMuted} /></TouchableOpacity>;
}

export default function MoreScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const snapshot = await getDoc(doc(db, 'users', user.uid));
        if (active && snapshot.exists()) setProfile({ uid: user.uid, ...snapshot.data() });
      } catch (error) { console.error('Could not load admin profile:', error); }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, []);

  const logout = () => Alert.alert('Sign out?', 'Are you sure you want to sign out of the administrator account?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: async () => { try { await signOut(auth); router.replace('/(auth)'); } catch (error) { Alert.alert('Sign out failed', error?.message || 'Please try again.'); } } },
  ]);
  const name = profile?.name || profile?.fullName || profile?.fullname || profile?.displayName || 'Administrator';
  const email = profile?.email || auth.currentUser?.email || '';

  return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>More</Text><Text style={styles.subtitle}>Account and school tools</Text>
    <View style={styles.profileCard}><View style={styles.avatar}><Ionicons name="shield-checkmark-outline" size={27} color={Colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.profileName}>{loading ? 'Loading profile...' : name}</Text><Text style={styles.profileEmail}>{email}</Text><View style={styles.roleBadge}><Text style={styles.roleText}>ADMINISTRATOR</Text></View></View></View>
    <Text style={styles.sectionTitle}>Manage school</Text>
    <SettingRow icon="people-outline" title="Students" description="View students and link parent accounts" onPress={() => router.push('/(admin)/(tabs)/student')} />
    <SettingRow icon="wallet-outline" title="Fees & finance" description="Review outstanding student fee balances" onPress={() => router.push('/(admin)/(tabs)/finance')} />
    <SettingRow icon="person-add-outline" title="Add student" description="Register a new student record" onPress={() => router.push('/add-student')} />
    <Text style={styles.sectionTitle}>Account</Text>
    <SettingRow icon="log-out-outline" title="Sign out" description="Sign out of the administrator portal" danger onPress={logout} />
    <View style={styles.footer}><Text style={styles.footerTitle}>Rydimma Educational Complex</Text><Text style={styles.footerText}>School management app · {new Date().getFullYear()}</Text></View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background }, content: { padding: 20, paddingBottom: 35 }, title: { fontSize: 27, fontWeight: '900', color: Colors.textDark }, subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 5, marginBottom: 22 }, profileCard: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 17, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 }, avatar: { width: 54, height: 54, borderRadius: 17, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, profileName: { fontSize: 15, fontWeight: '900', color: Colors.textDark }, profileEmail: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 }, roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: Colors.primaryLight, marginTop: 7 }, roleText: { color: Colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 }, sectionTitle: { fontSize: 15, fontWeight: '900', color: Colors.textDark, marginTop: 27, marginBottom: 11 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, marginBottom: 9 }, rowIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, dangerIcon: { backgroundColor: '#FEE2E2' }, rowTitle: { fontSize: 13, fontWeight: '800', color: Colors.textDark }, rowDescription: { fontSize: 10, color: Colors.textSecondary, marginTop: 4, lineHeight: 15 }, footer: { alignItems: 'center', marginTop: 32, padding: 18 }, footerTitle: { fontSize: 12, fontWeight: '900', color: Colors.textSecondary }, footerText: { fontSize: 10, color: Colors.textMuted, marginTop: 5 } });
