import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { fetchStudents } from '@/services/admin/student';

const balanceOf = (student) => Number(student.stats?.feeBalance ?? student.feeBalance ?? 0) || 0;
const money = (value) => `GH₵ ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FinanceScreen() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try { setStudents(await fetchStudents()); }
    catch (err) { console.error('Fee balance load failed:', err); setError('Could not load fee balances. Check your connection and Firestore permissions.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totalOutstanding = useMemo(() => students.reduce((sum, student) => sum + balanceOf(student), 0), [students]);
  const owingCount = useMemo(() => students.filter((student) => balanceOf(student) > 0).length, [students]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => `${student.firstName || ''} ${student.otherName || ''} ${student.lastName || ''} ${student.admissionNumber || ''}`.toLowerCase().includes(term));
  }, [students, search]);

  const renderStudent = ({ item }) => {
    const balance = balanceOf(item);
    return <View style={styles.studentRow}><View style={styles.avatar}><Text style={styles.initials}>{`${item.firstName?.[0] || ''}${item.lastName?.[0] || ''}`.toUpperCase() || 'S'}</Text></View><View style={{ flex: 1 }}><Text style={styles.studentName}>{`${item.firstName || ''} ${item.otherName || ''} ${item.lastName || ''}`.replace(/\s+/g, ' ').trim()}</Text><Text style={styles.meta}>{item.admissionNumber || 'No admission number'} · {item.className || item.class || 'No class'}</Text></View><View style={styles.amountContainer}><Text style={[styles.amount, balance > 0 ? styles.amountDue : styles.amountClear]}>{money(balance)}</Text><Text style={styles.amountLabel}>{balance > 0 ? 'Outstanding' : 'No balance'}</Text></View></View>;
  };

  return <SafeAreaView style={styles.container}><View style={styles.header}><View><Text style={styles.title}>Fees & Finance</Text><Text style={styles.subtitle}>Review recorded student fee balances</Text></View><TouchableOpacity style={styles.refresh} onPress={() => load(true)}><Ionicons name="refresh-outline" size={21} color={Colors.primary} /></TouchableOpacity></View>
    <View style={styles.summaryCard}><View style={styles.summaryIcon}><Ionicons name="wallet-outline" size={24} color={Colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.summaryLabel}>Total outstanding balances</Text><Text style={styles.summaryAmount}>{money(totalOutstanding)}</Text><Text style={styles.summaryHint}>{owingCount} students with a recorded balance · {students.length} students total</Text></View></View>
    <View style={styles.search}><Ionicons name="search-outline" size={19} color={Colors.textMuted} /><TextInput value={search} onChangeText={setSearch} placeholder="Search student or admission number" placeholderTextColor={Colors.textMuted} style={styles.searchInput} /></View>
    <View style={styles.listHeader}><Text style={styles.sectionTitle}>Student balances</Text><Text style={styles.count}>{filtered.length} records</Text></View>
    {loading ? <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.helper}>Loading balances...</Text></View> : error ? <View style={styles.center}><Ionicons name="alert-circle-outline" size={36} color={Colors.danger} /><Text style={styles.error}>{error}</Text><TouchableOpacity style={styles.retry} onPress={() => load()}><Text style={styles.retryText}>Try again</Text></TouchableOpacity></View> : <FlatList data={filtered} keyExtractor={(item) => item.id} renderItem={renderStudent} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />} ListEmptyComponent={<View style={styles.empty}><Ionicons name="wallet-outline" size={32} color={Colors.primary} /><Text style={styles.studentName}>No student records found</Text></View>} />}
    <View style={styles.notice}><Ionicons name="information-circle-outline" size={18} color={Colors.primary} /><Text style={styles.noticeText}>Balances are read from each student's stats.feeBalance (or feeBalance) field. Add or update the balance in the student record to keep this report accurate. This screen does not process online payments.</Text></View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background }, header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, title: { fontSize: 25, fontWeight: '900', color: Colors.textDark }, subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 5 }, refresh: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }, summaryCard: { marginHorizontal: 20, backgroundColor: Colors.white, borderRadius: 17, borderWidth: 1, borderColor: Colors.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 }, summaryIcon: { width: 49, height: 49, borderRadius: 15, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, summaryLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' }, summaryAmount: { fontSize: 23, fontWeight: '900', color: Colors.primary, marginTop: 4 }, summaryHint: { fontSize: 10, color: Colors.textMuted, marginTop: 4 }, search: { marginHorizontal: 20, marginTop: 18, height: 48, borderRadius: 13, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12 }, searchInput: { flex: 1, fontSize: 13, color: Colors.text }, listHeader: { marginHorizontal: 20, marginTop: 22, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { fontSize: 16, fontWeight: '900', color: Colors.textDark }, count: { fontSize: 11, color: Colors.textMuted }, list: { paddingHorizontal: 20, paddingBottom: 15 }, studentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 12, marginBottom: 9 }, avatar: { width: 41, height: 41, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, initials: { color: Colors.primary, fontWeight: '900', fontSize: 12 }, studentName: { fontSize: 12, color: Colors.textDark, fontWeight: '800' }, meta: { fontSize: 9, color: Colors.textMuted, marginTop: 4 }, amountContainer: { alignItems: 'flex-end' }, amount: { fontSize: 12, fontWeight: '900' }, amountDue: { color: Colors.danger }, amountClear: { color: Colors.success }, amountLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 3 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25, gap: 10 }, helper: { color: Colors.textSecondary, fontSize: 12 }, error: { textAlign: 'center', color: Colors.danger, fontSize: 12, lineHeight: 18 }, retry: { backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }, retryText: { color: Colors.white, fontWeight: '800' }, empty: { alignItems: 'center', padding: 30, gap: 12 }, notice: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: Colors.primaryLight, padding: 12, marginHorizontal: 20, marginBottom: 10, borderRadius: 12 }, noticeText: { flex: 1, fontSize: 10, lineHeight: 16, color: Colors.textDark } });
