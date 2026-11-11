import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { getAdminData, getTeacherData, getParentData, fetchTodayPresentAttendance, fetchTodayAbsentAttendance, fetchTodayLateAttendance } from '@/services/admin/dashboard';
import { fetchStudents } from '@/services/admin/student';

function MetricCard({ icon, label, value, note }) {
  return <View style={styles.metricCard}><View style={styles.metricIcon}><Ionicons name={icon} size={21} color={Colors.primary} /></View><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricNote}>{note}</Text></View>;
}

function QuickAction({ icon, label, onPress }) {
  return <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}><View style={styles.actionIcon}><Ionicons name={icon} size={22} color={Colors.primary} /></View><Text style={styles.actionLabel}>{label}</Text><Ionicons name="chevron-forward" size={17} color={Colors.textMuted} /></TouchableOpacity>;
}

export default function AdminHome() {
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({ students: 0, teachers: 0, parents: 0 });
  const [attendance, setAttendance] = useState({ present: 0, absent: 0, late: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const [admin, students, teachers, parents] = await Promise.all([getAdminData(), fetchStudents(), getTeacherData(), getParentData()]);
      setProfile(admin);
      setCounts({ students: students.length, teachers: teachers.length, parents: parents.length });
      const attendanceResults = await Promise.allSettled([fetchTodayPresentAttendance(), fetchTodayAbsentAttendance(), fetchTodayLateAttendance()]);
      setAttendance({
        present: attendanceResults[0].status === 'fulfilled' ? attendanceResults[0].value.length : 0,
        absent: attendanceResults[1].status === 'fulfilled' ? attendanceResults[1].value.length : 0,
        late: attendanceResults[2].status === 'fulfilled' ? attendanceResults[2].value.length : 0,
      });
    } catch (err) {
      console.error('Admin dashboard load error:', err);
      setError('Some dashboard information could not be loaded. Check your connection and Firestore permissions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadDashboard(); }, [loadDashboard]));

  const attendanceTotal = attendance.present + attendance.absent + attendance.late;
  const attendancePercentage = attendanceTotal ? Math.round((attendance.present / attendanceTotal) * 100) : 0;
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const adminName = profile?.name || profile?.fullName || profile?.fullname || profile?.displayName || 'Administrator';

  return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard(true)} tintColor={Colors.primary} />}>
    <View style={styles.header}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>RYDIMMA EDUCATIONAL COMPLEX</Text><Text style={styles.greeting}>Hello, {adminName} 👋</Text><Text style={styles.subtitle}>Here's your school's current overview.</Text></View><TouchableOpacity style={styles.profileIcon} onPress={() => router.push('/(admin)/(tabs)/more')}><Ionicons name="settings-outline" size={22} color={Colors.primary} /></TouchableOpacity></View>
    {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.helper}>Loading school information...</Text></View> : <>
      {!!error && <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={18} color={Colors.danger} /><Text style={styles.errorText}>{error}</Text></View>}
      <Text style={styles.sectionTitle}>School overview</Text>
      <View style={styles.metricsGrid}><MetricCard icon="people-outline" label="Students" value={counts.students} note="Student records" /><MetricCard icon="school-outline" label="Teachers" value={counts.teachers} note="Registered accounts" /><MetricCard icon="people-circle-outline" label="Parents" value={counts.parents} note="Registered accounts" /><MetricCard icon="wallet-outline" label="Fee balances" value="Open Fees" note="Review student balances" /></View>
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actions}><QuickAction icon="person-add-outline" label="Add student" onPress={() => router.push('/add-student')} /><QuickAction icon="people-outline" label="Manage students" onPress={() => router.push('/(admin)/(tabs)/student')} /><QuickAction icon="wallet-outline" label="Fee balances" onPress={() => router.push('/(admin)/(tabs)/finance')} /><QuickAction icon="settings-outline" label="Settings & account" onPress={() => router.push('/(admin)/(tabs)/more')} /></View>
      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Today's attendance</Text><Text style={styles.date}>{dateLabel}</Text></View>
      <View style={styles.attendanceCard}><View style={styles.attendanceTop}><View><Text style={styles.attendanceLabel}>Present attendance</Text><Text style={styles.attendanceHint}>{attendanceTotal ? `${attendanceTotal} recorded attendance entries` : 'No attendance entries found for today'}</Text></View><Text style={styles.percentage}>{attendancePercentage}%</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${attendancePercentage}%` }]} /></View><View style={styles.attendanceCounts}><View><Text style={styles.countLabel}>Present</Text><Text style={styles.countValue}>{attendance.present}</Text></View><View><Text style={styles.countLabel}>Absent</Text><Text style={styles.countValue}>{attendance.absent}</Text></View><View><Text style={styles.countLabel}>Late</Text><Text style={styles.countValue}>{attendance.late}</Text></View></View></View>
      <View style={styles.infoCard}><Ionicons name="information-circle-outline" size={20} color={Colors.primary} /><Text style={styles.infoText}>Use Students to create records and link registered parent accounts. Parents will see only children linked to their account.</Text></View>
    </>}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, content: { paddingHorizontal: 20, paddingTop: 17, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 25 }, eyebrow: { color: Colors.primary, fontSize: 9, letterSpacing: 1, fontWeight: '900' }, greeting: { fontSize: 23, fontWeight: '900', color: Colors.textDark, marginTop: 6 }, subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 5, lineHeight: 18 }, profileIcon: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  loading: { minHeight: 250, alignItems: 'center', justifyContent: 'center', gap: 12 }, helper: { fontSize: 12, color: Colors.textSecondary }, errorBox: { flexDirection: 'row', gap: 8, backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginBottom: 18 }, errorText: { flex: 1, color: Colors.danger, fontSize: 12, lineHeight: 18 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: Colors.textDark, marginBottom: 13 }, metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 23 }, metricCard: { width: '48.5%', backgroundColor: Colors.white, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 10 }, metricIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }, metricLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' }, metricValue: { fontSize: 23, color: Colors.textDark, fontWeight: '900', marginTop: 4 }, metricNote: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  actions: { marginBottom: 18 }, actionCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 13, marginBottom: 9 }, actionIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, actionLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.text }, sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }, date: { fontSize: 10, color: Colors.textMuted, marginBottom: 13 },
  attendanceCard: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 17, padding: 16 }, attendanceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, attendanceLabel: { fontSize: 13, fontWeight: '800', color: Colors.textDark }, attendanceHint: { fontSize: 10, color: Colors.textMuted, marginTop: 5 }, percentage: { fontSize: 24, fontWeight: '900', color: Colors.success }, progressTrack: { height: 8, borderRadius: 8, backgroundColor: '#E5E7EB', overflow: 'hidden', marginTop: 16 }, progressFill: { height: '100%', backgroundColor: Colors.success, borderRadius: 8 }, attendanceCounts: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }, countLabel: { fontSize: 11, color: Colors.textSecondary }, countValue: { fontSize: 17, fontWeight: '900', color: Colors.textDark, marginTop: 4 }, infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 13, backgroundColor: Colors.primaryLight, borderRadius: 13, marginTop: 20 }, infoText: { flex: 1, fontSize: 11, color: Colors.textDark, lineHeight: 17 },
});
