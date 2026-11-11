import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { Colors } from '@/constants/colors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const sendReset = async () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      Alert.alert('Valid email required', 'Enter the email address for your account.');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, normalized);
      Alert.alert('Reset email sent', 'Check your inbox for a password reset link.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      console.error('Password reset failed:', error);
      Alert.alert('Unable to send reset email', error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return <SafeAreaView style={styles.container}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={Colors.text} /></TouchableOpacity>
    <View style={styles.icon}><Ionicons name="key-outline" size={31} color={Colors.primary} /></View>
    <Text style={styles.title}>Reset your password</Text>
    <Text style={styles.subtitle}>Enter the email address associated with your school account. We'll send you a secure reset link.</Text>
    <Text style={styles.label}>Email address</Text>
    <View style={styles.input}><Ionicons name="mail-outline" size={20} color={Colors.textSecondary} /><TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={Colors.textMuted} autoCapitalize="none" keyboardType="email-address" style={styles.inputText} editable={!loading} /></View>
    <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={sendReset} disabled={loading}>{loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Send reset link</Text>}</TouchableOpacity>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.white }, content: { padding: 24, paddingTop: 12, flexGrow: 1 }, back: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }, icon: { width: 68, height: 68, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginTop: 42 }, title: { fontSize: 25, fontWeight: '900', color: Colors.textDark, marginTop: 22 }, subtitle: { color: Colors.textSecondary, fontSize: 13, lineHeight: 21, marginTop: 10 }, label: { fontSize: 12, fontWeight: '800', color: Colors.text, marginTop: 28, marginBottom: 8 }, input: { minHeight: 52, borderWidth: 1, borderColor: Colors.border, borderRadius: 13, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10 }, inputText: { flex: 1, color: Colors.text, fontSize: 14, paddingVertical: 12 }, button: { minHeight: 52, backgroundColor: Colors.primary, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 17 }, buttonText: { color: Colors.white, fontSize: 14, fontWeight: '800' } });
