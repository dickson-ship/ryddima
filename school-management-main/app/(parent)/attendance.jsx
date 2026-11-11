import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { ParentScreen, ChildPicker, EmptyState, studentName } from '@/components/parent/ParentScreen';
import { useParentPortal } from '@/hooks/use-parent-portal';
import { fetchParentAttendance, formatSchoolDate } from '@/services/parent/records';
import { Colors } from '@/constants/colors';

export default function ParentAttendance() {
  const params = useLocalSearchParams();
  const { children, selectedChild, loading, refreshing, error, reload } = useParentPortal(params.studentId);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const loadRecords = useCallback(async () => {
    if (!selectedChild?.id) { setRecords([]); return; }
    setRecordsLoading(true); setRecordsError('');
    try { setRecords(await fetchParentAttendance(selectedChild.id)); }
    catch (err) { console.error('Parent attendance load error:', err); setRecordsError('Could not load attendance records. Please refresh or contact the school.'); }
    finally { setRecordsLoading(false); }
  }, [selectedChild?.id]);
  useFocusEffect(useCallback(() => { loadRecords(); }, [loadRecords]));
  const counts = records.reduce((all, item) => { const status = String(item.status || '').toLowerCase(); if (status === 'present') all.present++; else if (status === 'late') all.late++; else if (status === 'absent') all.absent++; return all; }, { present: 0, late: 0, absent: 0 });
  const pageError = error || recordsError;
  return <ParentScreen title="Attendance" subtitle="Daily attendance records" loading={loading} refreshing={refreshing || recordsLoading} error={pageError} onRefresh={async (refresh) => { await reload(refresh); await loadRecords(); }}>
    {!selectedChild ? <EmptyState icon="calendar-outline" title="No linked student" message="Attendance will be available when a student is linked to your account." /> : <>
      <ChildPicker children={children} selectedChild={selectedChild} onSelect={(id) => router.replace({ pathname: '/(parent)/attendance', params: { studentId: id } })} />
      <View style={styles.summary}><Summary label="Present" value={counts.present} color={Colors.success} /><Summary label="Late" value={counts.late} color={Colors.warning} /><Summary label="Absent" value={counts.absent} color={Colors.danger} /></View>
      <Text style={styles.heading}>{studentName(selectedChild)} · History</Text>
      {recordsLoading ? <View style={styles.loading}><ActivityIndicator color={Colors.primary} /><Text style={styles.muted}>Loading attendance history...</Text></View> : records.length === 0 ? <EmptyState icon="calendar-outline" title="No attendance recorded" message="No attendance records are available for this student yet." /> : records.map((record) => {
        const status = String(record.status || 'unknown').toLowerCase(); const color = status === 'present' ? Colors.success : status === 'late' ? Colors.warning : status === 'absent' ? Colors.danger : Colors.textSecondary;
        return <View key={record.id} style={styles.record}><View style={styles.dateIcon}><Text style={styles.dateDay}>{new Date(`${String(record.date || record.id).slice(0, 10)}T12:00:00`).getDate() || '—'}</Text></View><View style={{ flex: 1 }}><Text style={styles.date}>{formatSchoolDate(record.date || record.id)}</Text><Text style={styles.classText}>{record.className || selectedChild.className || selectedChild.class || 'School attendance'}</Text></View><View style={[styles.status, { backgroundColor: `${color}18` }]}><Text style={[styles.statusText, { color }]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text></View></View>;
      })}
    </>}
  </ParentScreen>;
}
function Summary({ label, value, color }) { return <View style={styles.summaryItem}><Text style={[styles.count, { color }]}>{value}</Text><Text style={styles.muted}>{label}</Text></View>; }
const styles = StyleSheet.create({ summary: { flexDirection: 'row', gap: 9, marginBottom: 23 }, summaryItem: { flex: 1, backgroundColor: Colors.white, borderRadius: 15, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }, count: { fontSize: 22, fontWeight: '900' }, muted: { color: Colors.textSecondary, fontSize: 11, marginTop: 5 }, heading: { color: Colors.textDark, fontSize: 15, fontWeight: '900', marginBottom: 12 }, record: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 15, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, marginBottom: 9 }, dateIcon: { width: 43, height: 43, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, dateDay: { color: Colors.primary, fontSize: 16, fontWeight: '900' }, date: { color: Colors.textDark, fontSize: 12, fontWeight: '800' }, classText: { color: Colors.textSecondary, fontSize: 10, marginTop: 4 }, status: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9 }, statusText: { fontSize: 10, fontWeight: '900' }, loading: { alignItems: 'center', padding: 25 } });
