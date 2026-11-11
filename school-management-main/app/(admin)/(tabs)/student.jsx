import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Keyboard, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { StudentCard, EmptyState } from '@/components/adminComponents/student';
import { CLASSES } from '@/components/adminComponents/studentDummyData';
import { fetchStudents } from '@/services/admin/student';

export default function StudentsScreen() {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadStudents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setLoadError('');
    try {
      const data = await fetchStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Could not load students:', error);
      setLoadError('Unable to load students. Check your connection and Firestore permissions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadStudents(true); }, [loadStudents]));

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => {
      const studentClass = student.className || student.class || '';
      const matchesClass = selectedClass === 'All' || studentClass === selectedClass;
      const fullName = `${student.firstName || ''} ${student.otherName || ''} ${student.lastName || ''}`.toLowerCase();
      const admission = String(student.admissionNumber || '').toLowerCase();
      return matchesClass && (!term || fullName.includes(term) || admission.includes(term));
    });
  }, [search, selectedClass, students]);

  const openStudent = (student) => router.push({ pathname: '/student/[studentProfile]', params: { studentProfile: student.id, id: student.id, firstName: student.firstName || '', otherName: student.otherName || '', lastName: student.lastName || '', className: student.className || student.class || '', gender: student.gender || '', status: student.status || 'Active', admissionNumber: student.admissionNumber || '', admissionDate: student.admissionDate || '', dateOfBirth: student.dateOfBirth || '', parent: JSON.stringify(student.parent || {}), stats: JSON.stringify(student.stats || {}) } });
  const openParentLink = (student) => router.push({ pathname: '/link-parent', params: { studentId: student.id } });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Students</Text>
          <Text style={styles.subtitle}>Manage student records and parent account links</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-student')} activeOpacity={0.8} accessibilityLabel="Add student">
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Search name or admission number" placeholderTextColor={Colors.textMuted} style={styles.searchInput} returnKeyType="search" onSubmitEditing={Keyboard.dismiss} />
        {!!search && <TouchableOpacity onPress={() => setSearch('')} hitSlop={10}><Ionicons name="close-circle" size={19} color={Colors.textMuted} /></TouchableOpacity>}
      </View>

      <View style={styles.filterSection}>
        <FlatList horizontal data={CLASSES} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList} renderItem={({ item }) => {
          const active = selectedClass === item;
          return <TouchableOpacity style={[styles.filterButton, active && styles.filterButtonActive]} onPress={() => setSelectedClass(item)} activeOpacity={0.8}><Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text></TouchableOpacity>;
        }} />
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultText}>{filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}</Text>
        {selectedClass !== 'All' && <TouchableOpacity onPress={() => setSelectedClass('All')}><Text style={styles.clearFilter}>Clear filter</Text></TouchableOpacity>}
      </View>

      {loading ? <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.helperText}>Loading students...</Text></View> : loadError ? <View style={styles.centered}><Ionicons name="cloud-offline-outline" size={38} color={Colors.danger} /><Text style={styles.errorText}>{loadError}</Text><TouchableOpacity style={styles.retryButton} onPress={() => loadStudents()}><Text style={styles.retryText}>Try again</Text></TouchableOpacity></View> : (
        <FlatList data={filteredStudents} keyExtractor={(item) => item.id} renderItem={({ item }) => <StudentCard student={item} onPress={() => openStudent(item)} onLinkParent={() => openParentLink(item)} />} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.listContent, !filteredStudents.length && styles.emptyListContent]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadStudents(true)} tintColor={Colors.primary} />} ListEmptyComponent={<EmptyState title={students.length ? 'No matching students' : 'No students yet'} message={students.length ? 'Try changing your search or class filter.' : 'Add a student to start managing student records.'} />} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { fontSize: 27, fontWeight: '800', color: Colors.textDark },
  subtitle: { marginTop: 4, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  addButton: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { marginHorizontal: 20, height: 50, paddingHorizontal: 15, backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: Colors.text, paddingVertical: 0 },
  filterSection: { marginTop: 16 },
  filterList: { paddingHorizontal: 20, gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  resultHeader: { paddingHorizontal: 20, marginTop: 22, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  clearFilter: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  emptyListContent: { flexGrow: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  helperText: { color: Colors.textSecondary, fontSize: 13 },
  errorText: { color: Colors.danger, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  retryButton: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 10 },
  retryText: { color: Colors.white, fontWeight: '700' },
});
