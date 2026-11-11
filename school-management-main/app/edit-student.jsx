import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Colors } from '@/constants/colors';
import { useRoleGuard } from '@/hooks/use-role-guard';

const FIELDS = [
  { key: 'firstName', label: 'First name', required: true },
  { key: 'otherName', label: 'Other name' },
  { key: 'lastName', label: 'Last name', required: true },
  { key: 'admissionNumber', label: 'Admission number', required: true },
  { key: 'className', label: 'Class', required: true },
  { key: 'gender', label: 'Gender' },
  { key: 'dateOfBirth', label: 'Date of birth (DD/MM/YYYY)' },
  { key: 'admissionDate', label: 'Admission date (DD/MM/YYYY)' },
  { key: 'status', label: 'Status' },
  { key: 'parentName', label: 'Parent / guardian name' },
  { key: 'parentPhone', label: 'Parent / guardian phone', keyboardType: 'phone-pad' },
  { key: 'parentEmail', label: 'Parent / guardian email', keyboardType: 'email-address' },
];

export default function EditStudentScreen() {
  const { loading: checkingRole, user, allowed } = useRoleGuard('admin');
  const params = useLocalSearchParams();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!studentId) { setLoadError('Student ID is missing.'); setLoading(false); return; }
      try {
        const snapshot = await getDoc(doc(db, 'students', studentId));
        if (!snapshot.exists()) { setLoadError('Student record not found.'); return; }
        const student = snapshot.data();
        const parent = student.parent || {};
        const nextForm = {
          firstName: student.firstName || '', otherName: student.otherName || '', lastName: student.lastName || '',
          admissionNumber: student.admissionNumber || '', className: student.className || student.class || '',
          gender: student.gender || '', dateOfBirth: student.dateOfBirth || '', admissionDate: student.admissionDate || '',
          status: student.status || 'Active', parentName: parent.name || student.parentName || '',
          parentPhone: parent.phone || student.parentPhone || '', parentEmail: parent.email || student.parentEmail || '',
        };
        if (active) setForm(nextForm);
      } catch (error) {
        console.error('Could not load student for editing:', error);
        if (active) setLoadError('Unable to load the student. Check your connection and permissions.');
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [studentId]);

  const updateField = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  const save = async () => {
    for (const field of FIELDS.filter((item) => item.required)) {
      if (!String(form[field.key] || '').trim()) { Alert.alert('Required field', `${field.label} is required.`); return; }
    }
    const parentEmail = String(form.parentEmail || '').trim().toLowerCase();
    if (parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) { Alert.alert('Invalid email', 'Enter a valid parent email address.'); return; }
    try {
      setSaving(true);
      const studentRef = doc(db, 'students', studentId);
      const snapshot = await getDoc(studentRef);
      if (!snapshot.exists()) throw new Error('Student record no longer exists.');
      const current = snapshot.data();
      await updateDoc(studentRef, {
        firstName: form.firstName.trim(), otherName: (form.otherName || '').trim(), lastName: form.lastName.trim(),
        admissionNumber: form.admissionNumber.trim().toUpperCase(), className: form.className.trim(),
        gender: (form.gender || '').trim(), dateOfBirth: (form.dateOfBirth || '').trim(),
        admissionDate: (form.admissionDate || '').trim(), status: (form.status || 'Active').trim(),
        parent: { ...(current.parent || {}), name: (form.parentName || '').trim(), phone: (form.parentPhone || '').trim(), email: parentEmail },
        updatedAt: serverTimestamp(),
      });
      Alert.alert('Student updated', 'The student details have been saved.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      console.error('Student update failed:', error);
      Alert.alert('Unable to save changes', error?.message || 'Please try again.');
    } finally { setSaving(false); }
  };

  if (checkingRole) return <SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View></SafeAreaView>;
  if (!user || !allowed) return <Redirect href="/(auth)" />;
  if (loading) return <SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.helper}>Loading student...</Text></View></SafeAreaView>;
  if (loadError) return <SafeAreaView style={styles.container}><View style={styles.center}><Text style={styles.error}>{loadError}</Text><TouchableOpacity style={styles.button} onPress={() => router.back()}><Text style={styles.buttonText}>Go back</Text></TouchableOpacity></View></SafeAreaView>;

  return <SafeAreaView style={styles.container}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.header}><TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={Colors.text} /></TouchableOpacity><Text style={styles.headerTitle}>Edit Student</Text><View style={{ width: 40 }} /></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.notice}><Ionicons name="information-circle-outline" size={20} color={Colors.primary} /><Text style={styles.noticeText}>These fields update the student profile. Parent account linking is managed separately from Students using Link Parent.</Text></View>
      {FIELDS.map((field) => <View key={field.key} style={styles.field}><Text style={styles.label}>{field.label}{field.required ? ' *' : ''}</Text><TextInput style={styles.input} value={form[field.key] || ''} onChangeText={(value) => updateField(field.key, value)} placeholder={field.label} placeholderTextColor={Colors.textMuted} autoCapitalize={field.key === 'parentEmail' ? 'none' : 'words'} keyboardType={field.keyboardType || 'default'} editable={!saving} /></View>)}
      <TouchableOpacity style={[styles.button, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>{saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Save Changes</Text>}</TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background }, header: { minHeight: 62, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border }, headerTitle: { fontSize: 17, fontWeight: '900', color: Colors.textDark }, content: { padding: 20, paddingBottom: 40 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 }, helper: { color: Colors.textSecondary, marginTop: 10 }, error: { color: Colors.danger, textAlign: 'center' }, notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.primaryLight, padding: 13, borderRadius: 12, marginBottom: 20 }, noticeText: { flex: 1, color: Colors.textDark, fontSize: 11, lineHeight: 17 }, field: { marginBottom: 14 }, label: { fontSize: 12, fontWeight: '800', color: Colors.text, marginBottom: 7 }, input: { minHeight: 48, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 13, color: Colors.text, fontSize: 13 }, button: { minHeight: 51, backgroundColor: Colors.primary, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingHorizontal: 16 }, buttonText: { color: Colors.white, fontWeight: '900', fontSize: 13 } });
