import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { ParentScreen, ChildPicker, EmptyState, studentName } from '@/components/parent/ParentScreen';
import { useParentPortal } from '@/hooks/use-parent-portal';
import { Colors } from '@/constants/colors';

export default function ParentStudentProfile() {
  const params = useLocalSearchParams();
  const { children, selectedChild, loading, refreshing, error, reload } = useParentPortal(params.studentId);
  return <ParentScreen title="Student profile" subtitle="Student information" loading={loading} refreshing={refreshing} error={error} onRefresh={reload}>
    {!selectedChild ? <EmptyState icon="people-outline" title="No linked student" message="Your child's profile will appear after the school administrator links the student record to your account." /> : <>
      <ChildPicker children={children} selectedChild={selectedChild} onSelect={(id) => router.replace({ pathname: '/(parent)/student', params: { studentId: id } })} />
      <View style={styles.hero}><View style={styles.avatar}><Ionicons name="person" size={31} color={Colors.primary} /></View><Text style={styles.name}>{studentName(selectedChild)}</Text><Text style={styles.admission}>{selectedChild.admissionNumber || 'Admission number not recorded'}</Text><View style={styles.badge}><Text style={styles.badgeText}>{selectedChild.status || 'Active'}</Text></View></View>
      <Text style={styles.section}>Personal and school details</Text>
      <InfoRow label="First name" value={selectedChild.firstName} /><InfoRow label="Other name" value={selectedChild.otherName} /><InfoRow label="Last name" value={selectedChild.lastName} /><InfoRow label="Class" value={selectedChild.className || selectedChild.class} /><InfoRow label="Admission number" value={selectedChild.admissionNumber} /><InfoRow label="Gender" value={selectedChild.gender} /><InfoRow label="Date of birth" value={selectedChild.dateOfBirth || selectedChild.dob} /><InfoRow label="Student status" value={selectedChild.status || 'Active'} />
      <Text style={styles.note}>If any information is incorrect, please contact the school administrator. Parents cannot change official student records.</Text>
    </>}
  </ParentScreen>;
}
function InfoRow({ label, value }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value || 'Not provided'}</Text></View>; }
const styles = StyleSheet.create({ hero: { alignItems: 'center', padding: 22, borderRadius: 18, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border }, avatar: { width: 70, height: 70, borderRadius: 23, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, name: { color: Colors.textDark, fontSize: 18, fontWeight: '900', marginTop: 12, textAlign: 'center' }, admission: { color: Colors.textSecondary, fontSize: 12, marginTop: 5 }, badge: { backgroundColor: Colors.successLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 10 }, badgeText: { color: Colors.success, fontWeight: '800', fontSize: 10 }, section: { color: Colors.textDark, fontWeight: '900', fontSize: 15, marginTop: 24, marginBottom: 10 }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 14, paddingVertical: 14 }, label: { color: Colors.textSecondary, fontSize: 12, flex: 1 }, value: { color: Colors.textDark, fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'right' }, note: { color: Colors.textSecondary, fontSize: 11, lineHeight: 17, marginTop: 15, padding: 13, borderRadius: 12, backgroundColor: Colors.primaryLight } });
