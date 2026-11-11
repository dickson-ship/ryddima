import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Keyboard, SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Colors } from '@/constants/colors';
import { useRoleGuard } from '@/hooks/use-role-guard';
import { Redirect } from 'expo-router';
import { db } from '@/services/firebase';
import { searchParentAccounts, linkParentToStudent, unlinkParentFromStudent } from '@/services/admin/parentStudentLinks';

const firstParam = (value) => Array.isArray(value) ? value[0] || '' : value || '';

export default function LinkParentScreen() {
  const { loading: checkingRole, user: signedInUser, allowed: isAdmin } = useRoleGuard('admin');
  const params = useLocalSearchParams();
  const studentId = firstParam(params.studentId);
  const [student, setStudent] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const currentParentUid = student?.parentUid || null;
  const studentName = [student?.firstName, student?.otherName, student?.lastName].filter(Boolean).join(' ') || 'Selected student';

  const loadStudent = useCallback(async () => {
    if (!studentId) {
      setStudent(null);
      setError('No student was selected. Return to Students and choose a student first.');
      setLoadingStudent(false);
      return;
    }
    setLoadingStudent(true);
    try {
      const snapshot = await getDoc(doc(db, 'students', studentId));
      if (!snapshot.exists()) {
        setStudent(null);
        setError('The selected student could not be found.');
        return;
      }
      const data = snapshot.data();
      let parent = data.parent || null;
      if (data.parentUid) {
        try {
          const parentSnapshot = await getDoc(doc(db, 'users', data.parentUid));
          if (parentSnapshot.exists()) {
            const p = parentSnapshot.data();
            parent = {
              ...(parent || {}),
              name: p.name || p.fullName || p.displayName || [p.firstName, p.lastName].filter(Boolean).join(' ') || parent?.name || 'Linked parent',
              email: p.email || p.emailLowercase || parent?.email || '',
              phone: p.phone || parent?.phone || '',
            };
          }
        } catch (parentError) {
          console.warn('Unable to load linked parent profile:', parentError);
        }
      }
      setStudent({ id: snapshot.id, ...data, parent });
      setError('');
    } catch (err) {
      console.error('Error loading selected student:', err);
      setError('Unable to load this student. Check your connection and Firestore permissions.');
    } finally {
      setLoadingStudent(false);
    }
  }, [studentId]);

  const loadParents = useCallback(async (term = '') => {
    setSearching(true);
    setSearchError('');
    try {
      const results = await searchParentAccounts(term);
      setParents(results);
      setSearchPerformed(true);
      setSelectedParent(null);
      if (!results.length) setSearchError(term.trim() ? 'No registered parent matches that name or email.' : 'No registered parent accounts were found. Register the parent account first, then return here.');
    } catch (err) {
      console.error('Error searching parent accounts:', err);
      setParents([]);
      setSearchPerformed(true);
      setSearchError('Could not load parent accounts. Check that parent profiles are in the users collection with role set to parent, and check Firestore permissions.');
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => { if (!checkingRole && isAdmin) loadStudent(); }, [checkingRole, isAdmin, loadStudent]);
  useEffect(() => { if (!checkingRole && isAdmin) loadParents(''); }, [checkingRole, isAdmin, loadParents]);

  const filteredParents = useMemo(() => parents, [parents]);

  const handleSearch = () => {
    Keyboard.dismiss();
    loadParents(searchTerm);
  };

  const performLink = async () => {
    const authUser = getAuth().currentUser;
    if (!authUser) {
      Alert.alert('Session expired', 'Please sign in again before linking a parent.');
      return;
    }
    if (!student?.id || !selectedParent?.uid) {
      Alert.alert('Select a parent', 'Choose a registered parent account first.');
      return;
    }
    if (selectedParent.role !== 'parent') {
      Alert.alert('Invalid account', 'Only accounts with the parent role can be linked.');
      return;
    }

    try {
      setSaving(true);
      await linkParentToStudent({ studentId: student.id, parentUid: selectedParent.uid, linkedBy: authUser.uid });
      const linkedName = selectedParent.name || selectedParent.fullName || 'The parent';
      await loadStudent();
      setSearchTerm('');
      setSelectedParent(null);
      await loadParents('');
      Alert.alert('Parent linked', `${linkedName} is now linked to ${studentName}.`);
    } catch (err) {
      console.error('Unable to link parent:', err);
      Alert.alert('Unable to link parent', err?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLinkParent = () => {
    if (!selectedParent) {
      Alert.alert('Select a parent', 'Choose a parent account from the list first.');
      return;
    }
    if (selectedParent.uid === currentParentUid) {
      Alert.alert('Already linked', 'This parent is already linked to this student.');
      return;
    }
    if (currentParentUid) {
      Alert.alert('Replace linked parent?', 'Replacing this link removes the previous parent account’s access to this student. Continue only after verifying the new parent’s identity.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace Parent', style: 'destructive', onPress: performLink },
      ]);
      return;
    }
    performLink();
  };

  const handleUnlink = () => {
    if (!student?.id || !currentParentUid) return;
    Alert.alert('Unlink parent?', 'This parent will no longer see this student in the parent dashboard. The parent login account and student record will remain.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unlink', style: 'destructive', onPress: async () => {
        const authUser = getAuth().currentUser;
        if (!authUser) {
          Alert.alert('Session expired', 'Please sign in again.');
          return;
        }
        try {
          setUnlinking(true);
          await unlinkParentFromStudent({ studentId: student.id, unlinkedBy: authUser.uid });
          await loadStudent();
          await loadParents('');
          Alert.alert('Parent unlinked', 'The parent account has been unlinked from this student.');
        } catch (err) {
          console.error('Unable to unlink parent:', err);
          Alert.alert('Unable to unlink parent', err?.message || 'Please try again.');
        } finally {
          setUnlinking(false);
        }
      } },
    ]);
  };

  if (checkingRole) {
    return <SafeAreaView style={styles.container}><View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.muted}>Verifying administrator access...</Text></View></SafeAreaView>;
  }
  if (!signedInUser || !isAdmin) return <Redirect href="/(auth)" />;

  if (loadingStudent) {
    return <SafeAreaView style={styles.container}><View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.muted}>Loading student...</Text></View></SafeAreaView>;
  }

  if (!student) {
    return <SafeAreaView style={styles.container}><View style={styles.header}><TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={Colors.text} /></TouchableOpacity><Text style={styles.headerTitle}>Link Parent</Text><View style={{ width: 40 }} /></View><View style={styles.centered}><Ionicons name="alert-circle-outline" size={42} color={Colors.danger} /><Text style={styles.heading}>Student unavailable</Text><Text style={styles.muted}>{error || 'The student could not be loaded.'}</Text><TouchableOpacity style={styles.primaryButton} onPress={loadStudent}><Text style={styles.primaryButtonText}>Try Again</Text></TouchableOpacity></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={Colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Link Parent Account</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.studentCard}>
          <View style={styles.studentIcon}><Ionicons name="school-outline" size={25} color={Colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>SELECTED STUDENT</Text>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.meta}>{student.admissionNumber || 'No admission number'} · {student.className || student.class || 'Class not assigned'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Current parent account</Text>
        {currentParentUid ? (
          <View style={styles.currentCard}>
            <View style={styles.parentAvatar}><Ionicons name="person" size={21} color={Colors.success} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.parentName}>{student.parent?.name || 'Linked parent'}</Text>
              <Text style={styles.parentEmail}>{student.parent?.email || 'Account linked'}</Text>
              <Text style={styles.linkedText}><Ionicons name="checkmark-circle" size={13} color={Colors.success} />  Linked to this student</Text>
            </View>
            <TouchableOpacity style={styles.unlinkButton} onPress={handleUnlink} disabled={unlinking || saving} accessibilityLabel="Unlink parent">
              {unlinking ? <ActivityIndicator color={Colors.danger} /> : <Ionicons name="unlink-outline" size={20} color={Colors.danger} />}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.notice}><Ionicons name="information-circle-outline" size={21} color={Colors.primary} /><Text style={styles.noticeText}>No parent account is linked. Student contact details do not automatically link a login account.</Text></View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Find a registered parent</Text>
        <Text style={styles.description}>Search by parent name or email. You can also leave the field empty and load all registered parent accounts.</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={19} color={Colors.textMuted} />
          <TextInput value={searchTerm} onChangeText={setSearchTerm} placeholder="Parent name or email" placeholderTextColor={Colors.textMuted} style={styles.searchInput} autoCapitalize="none" autoCorrect={false} keyboardType="default" returnKeyType="search" onSubmitEditing={handleSearch} editable={!searching && !saving && !unlinking} />
          {!!searchTerm && <TouchableOpacity onPress={() => { setSearchTerm(''); loadParents(''); }}><Ionicons name="close-circle" size={19} color={Colors.textMuted} /></TouchableOpacity>}
        </View>
        <TouchableOpacity style={[styles.primaryButton, (searching || saving || unlinking) && styles.disabled]} onPress={handleSearch} disabled={searching || saving || unlinking}>
          {searching ? <ActivityIndicator size="small" color={Colors.white} /> : <Ionicons name="search-outline" size={18} color={Colors.white} />}
          <Text style={styles.primaryButtonText}>{searching ? 'Loading accounts...' : searchTerm.trim() ? 'Search Parents' : 'Load All Parents'}</Text>
        </TouchableOpacity>

        {!!searchError && <View style={styles.errorBox}><Ionicons name="alert-circle-outline" size={19} color={Colors.danger} /><Text style={styles.errorText}>{searchError}</Text></View>}

        {searchPerformed && filteredParents.length > 0 && <View style={{ marginTop: 24 }}>
          <View style={styles.resultsHeader}><Text style={styles.sectionTitle}>Parent accounts</Text><Text style={styles.count}>{filteredParents.length} found</Text></View>
          {filteredParents.map((parent) => {
            const isCurrent = parent.uid === currentParentUid;
            const isSelected = selectedParent?.uid === parent.uid;
            return <TouchableOpacity key={parent.uid} style={[styles.parentRow, isSelected && styles.parentSelected, isCurrent && styles.parentCurrent]} onPress={() => !isCurrent && setSelectedParent(parent)} disabled={isCurrent || saving || unlinking} activeOpacity={0.8}>
              <View style={styles.resultAvatar}><Ionicons name="person-outline" size={20} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.parentName}>{parent.name || parent.fullName || 'Parent account'}</Text>
                <Text style={styles.parentEmail}>{parent.email || 'No email saved'}</Text>
                <Text style={styles.roleText}>Parent account</Text>
                {isCurrent && <Text style={styles.alreadyText}>Already linked to this student</Text>}
              </View>
              <Ionicons name={isCurrent ? 'checkmark-circle' : isSelected ? 'radio-button-on' : 'radio-button-off'} size={22} color={isCurrent || isSelected ? Colors.primary : Colors.textMuted} />
            </TouchableOpacity>;
          })}
          <TouchableOpacity style={[styles.primaryButton, (!selectedParent || selectedParent.uid === currentParentUid || saving || unlinking) && styles.disabled]} onPress={handleLinkParent} disabled={!selectedParent || selectedParent.uid === currentParentUid || saving || unlinking}>
            {saving ? <ActivityIndicator size="small" color={Colors.white} /> : <Ionicons name="link-outline" size={19} color={Colors.white} />}
            <Text style={styles.primaryButtonText}>{saving ? 'Linking parent...' : currentParentUid ? 'Replace Linked Parent' : 'Link Selected Parent'}</Text>
          </TouchableOpacity>
        </View>}

        <View style={[styles.notice, { marginTop: 22 }]}><Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} /><Text style={styles.noticeText}>Only registered parent accounts are listed. Linking uses the account UID, not just the parent's contact details.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { minHeight: 62, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: Colors.textDark, marginHorizontal: 8 },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 },
  muted: { fontSize: 12, color: Colors.textSecondary, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  heading: { fontSize: 17, fontWeight: '800', color: Colors.textDark, marginTop: 12 },
  studentCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: Colors.white, borderRadius: 18, padding: 17, borderWidth: 1, borderColor: Colors.border },
  studentIcon: { width: 54, height: 54, borderRadius: 17, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: Colors.textMuted, marginBottom: 5 },
  studentName: { fontSize: 17, fontWeight: '800', color: Colors.textDark },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginTop: 24, marginBottom: 10 },
  currentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14 },
  parentAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  parentName: { fontSize: 14, fontWeight: '800', color: Colors.textDark },
  parentEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  linkedText: { fontSize: 11, fontWeight: '700', color: Colors.success, marginTop: 7 },
  unlinkButton: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2' },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, backgroundColor: Colors.primaryLight, borderRadius: 13 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18, color: Colors.textDark },
  description: { fontSize: 12, lineHeight: 18, color: Colors.textSecondary, marginTop: -3, marginBottom: 12 },
  searchBox: { minHeight: 49, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.white },
  searchInput: { flex: 1, color: Colors.text, fontSize: 13, paddingVertical: 10 },
  primaryButton: { minHeight: 49, borderRadius: 13, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 16, marginTop: 13 },
  primaryButtonText: { fontSize: 13, fontWeight: '800', color: Colors.white },
  disabled: { opacity: 0.55 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 13, backgroundColor: '#FEE2E2', borderRadius: 12, marginTop: 13 },
  errorText: { flex: 1, fontSize: 12, lineHeight: 18, color: Colors.danger },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  count: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  parentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 15, marginBottom: 10 },
  parentSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  parentCurrent: { opacity: 0.8 },
  resultAvatar: { width: 43, height: 43, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  roleText: { marginTop: 5, fontSize: 10, color: Colors.textMuted },
  alreadyText: { marginTop: 5, fontSize: 11, fontWeight: '700', color: Colors.success },
});
