import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { ParentScreen } from '@/components/parent/ParentScreen';
import { useParentPortal } from '@/hooks/use-parent-portal';
import { db } from '@/services/firebase';
import { Colors } from '@/constants/colors';

export default function ParentProfile() {
  const { profile, loading, refreshing, error, reload } = useParentPortal();
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { setName(profile?.name || profile?.fullName || profile?.displayName || ''); setPhone(profile?.phone || ''); }, [profile]);
  const save = async () => {
    if (!profile?.uid) return;
    if (!name.trim()) { Alert.alert('Name required', 'Please enter your full name.'); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), { name: name.trim(), fullName: name.trim(), phone: phone.trim(), updatedAt: serverTimestamp() });
      Alert.alert('Profile updated', 'Your contact details have been saved.');
      await reload(true);
    } catch (err) {
      console.error('Parent profile update error:', err);
      Alert.alert('Could not save profile', err?.message || 'Please try again.');
    } finally { setSaving(false); }
  };
  return <ParentScreen title="My account" subtitle="Parent contact details" loading={loading} refreshing={refreshing} error={error} onRefresh={reload}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.profileHero}><View style={styles.avatar}><Ionicons name="person-outline" size={31} color={Colors.primary} /></View><Text style={styles.profileName}>{profile?.name || profile?.fullName || 'Parent account'}</Text><Text style={styles.email}>{profile?.email || 'Email not provided'}</Text><View style={styles.roleBadge}><Text style={styles.roleText}>PARENT ACCOUNT</Text></View></View>
      <Text style={styles.section}>Contact information</Text>
      <Text style={styles.label}>Full name</Text><TextInput value={name} onChangeText={setName} placeholder="Enter your full name" placeholderTextColor={Colors.textMuted} style={styles.input} autoCapitalize="words" />
      <Text style={styles.label}>Email address</Text><View style={[styles.input, styles.readOnly]}><Text style={styles.readOnlyText}>{profile?.email || 'No email address recorded'}</Text><Ionicons name="lock-closed-outline" size={16} color={Colors.textMuted} /></View><Text style={styles.help}>For account security, update your email through the school administrator.</Text>
      <Text style={styles.label}>Phone number</Text><TextInput value={phone} onChangeText={setPhone} placeholder="Enter your phone number" placeholderTextColor={Colors.textMuted} style={styles.input} keyboardType="phone-pad" />
      <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.65 }]} onPress={save} disabled={saving}><Ionicons name="save-outline" size={18} color={Colors.white} /><Text style={styles.saveText}>{saving ? 'Saving...' : 'Save changes'}</Text></TouchableOpacity>
      <View style={styles.security}><Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} /><Text style={styles.securityText}>Your account can only access student records that the school has linked to your parent account.</Text></View>
    </KeyboardAvoidingView>
  </ParentScreen>;
}
const styles = StyleSheet.create({ profileHero: { alignItems: 'center', padding: 22, backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.border }, avatar: { width: 66, height: 66, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, profileName: { color: Colors.textDark, fontWeight: '900', fontSize: 17, marginTop: 12 }, email: { color: Colors.textSecondary, fontSize: 12, marginTop: 5 }, roleBadge: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.primaryLight, marginTop: 10 }, roleText: { color: Colors.primary, fontWeight: '900', fontSize: 9, letterSpacing: 0.7 }, section: { color: Colors.textDark, fontWeight: '900', fontSize: 15, marginTop: 24, marginBottom: 15 }, label: { color: Colors.textDark, fontSize: 12, fontWeight: '800', marginBottom: 7, marginTop: 12 }, input: { minHeight: 48, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, backgroundColor: Colors.white, color: Colors.textDark, fontSize: 13 }, readOnly: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, readOnlyText: { color: Colors.textSecondary, fontSize: 13 }, help: { color: Colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 6 }, saveButton: { backgroundColor: Colors.primary, borderRadius: 13, padding: 14, marginTop: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }, saveText: { color: Colors.white, fontWeight: '900', fontSize: 13 }, security: { flexDirection: 'row', gap: 9, padding: 13, borderRadius: 13, backgroundColor: Colors.primaryLight, marginTop: 16 }, securityText: { color: Colors.textSecondary, fontSize: 11, lineHeight: 17, flex: 1 } });
