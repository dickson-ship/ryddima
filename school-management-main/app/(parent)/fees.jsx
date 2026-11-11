import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ParentScreen, ChildPicker, EmptyState, studentName } from '@/components/parent/ParentScreen';
import { useParentPortal } from '@/hooks/use-parent-portal';
import { Colors } from '@/constants/colors';

const money = (value) => `GH₵ ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export default function ParentFees() {
  const params = useLocalSearchParams();
  const { children, selectedChild, loading, refreshing, error, reload } = useParentPortal(params.studentId);
  const student = selectedChild || {};
  const totalFees = Number(student.totalFees ?? student.fees?.total ?? student.stats?.totalFees ?? 0);
  const paid = Number(student.amountPaid ?? student.fees?.paid ?? student.stats?.amountPaid ?? 0);
  const balance = Number(student.stats?.feeBalance ?? student.feeBalance ?? student.fees?.balance ?? Math.max(totalFees - paid, 0));
  const hasTotalFees = student.totalFees != null || student.fees?.total != null || student.stats?.totalFees != null;
  const hasPaid = student.amountPaid != null || student.fees?.paid != null || student.stats?.amountPaid != null;
  const hasBalance = student.stats?.feeBalance != null || student.feeBalance != null || student.fees?.balance != null || (hasTotalFees && hasPaid);
  return <ParentScreen title="School fees" subtitle="Fee balance overview" loading={loading} refreshing={refreshing} error={error} onRefresh={reload}>
    {!selectedChild ? <EmptyState icon="wallet-outline" title="No linked student" message="Fee information will appear here once your child's student record is linked to your account." /> : <>
      <ChildPicker children={children} selectedChild={selectedChild} onSelect={(id) => router.replace({ pathname: '/(parent)/fees', params: { studentId: id } })} />
      <View style={styles.studentBanner}><View style={styles.bannerIcon}><Ionicons name="wallet-outline" size={24} color={Colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.studentName}>{studentName(student)}</Text><Text style={styles.studentClass}>{student.className || student.class || 'Class not assigned'}</Text></View></View>
      <View style={styles.balanceCard}><Text style={styles.balanceLabel}>Outstanding balance</Text><Text style={styles.balanceValue}>{money(balance)}</Text><Text style={styles.balanceHint}>{balance <= 0 ? 'No outstanding balance is recorded.' : 'Please contact the school office for payment instructions.'}</Text></View>
      <View style={styles.breakdown}><FeeRow label="Total fees" value={hasTotalFees ? money(totalFees) : 'Not recorded'} /><FeeRow label="Amount paid" value={hasPaid ? money(paid) : 'Not recorded'} /><FeeRow label="Balance remaining" value={hasBalance ? money(balance) : 'Not recorded'} strong /></View>
      <View style={styles.notice}><Ionicons name="information-circle-outline" size={20} color={Colors.primary} /><Text style={styles.noticeText}>This screen displays the fee information stored by the school. It does not accept online payments. For an updated statement or payment arrangements, contact the school administration.</Text></View>
    </>}
  </ParentScreen>;
}
function FeeRow({ label, value, strong }) { return <View style={styles.feeRow}><Text style={[styles.feeLabel, strong && styles.strong]}>{label}</Text><Text style={[styles.feeValue, strong && styles.strong]}>{value}</Text></View>; }
const styles = StyleSheet.create({ studentBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 14, marginBottom: 14 }, bannerIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, studentName: { color: Colors.textDark, fontWeight: '900', fontSize: 14 }, studentClass: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 }, balanceCard: { backgroundColor: Colors.primary, borderRadius: 20, padding: 21 }, balanceLabel: { color: '#F8E9EB', fontSize: 12, fontWeight: '700' }, balanceValue: { color: Colors.white, fontSize: 29, fontWeight: '900', marginTop: 8 }, balanceHint: { color: '#F8E9EB', fontSize: 11, lineHeight: 17, marginTop: 10 }, breakdown: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 15, paddingVertical: 4, marginTop: 15 }, feeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: Colors.border }, feeLabel: { color: Colors.textSecondary, fontSize: 12 }, feeValue: { color: Colors.textDark, fontSize: 12, fontWeight: '700' }, strong: { color: Colors.primary, fontWeight: '900' }, notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 13, backgroundColor: Colors.primaryLight, borderRadius: 13, marginTop: 15 }, noticeText: { flex: 1, color: Colors.textSecondary, fontSize: 11, lineHeight: 17 } });
