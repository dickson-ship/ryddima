import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import { auth, db } from '@/services/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function ParentLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert('Missing information', 'Enter your registered email and password.');
      return;
    }
    try {
      setLoading(true);
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const profileSnapshot = await getDoc(doc(db, 'users', credential.user.uid));
      if (!profileSnapshot.exists() || profileSnapshot.data().role !== 'parent') {
        await signOut(auth);
        Alert.alert('Access denied', 'This account is not registered as a parent.');
        return;
      }
      router.replace('/(parent)');
    } catch (error) {
      console.error('Parent login failed:', error);
      const message = error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password'
        ? 'The email or password is incorrect.'
        : error?.message || 'Unable to sign in. Please try again.';
      Alert.alert('Login failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      Alert.alert('Email required', 'Enter your registered email first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      Alert.alert('Check your email', 'If the account exists, Firebase has sent a password reset link.');
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Unable to send reset email', error?.message || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color={Colors.text} /></TouchableOpacity>
          <View style={styles.header}>
            <Image source={require('../../assets/images/crest.png')} style={styles.crest} resizeMode="contain" />
            <Text style={styles.schoolName}>RYDIMMA EDUCATIONAL COMPLEX</Text>
            <Text style={styles.title}>Parent Login</Text>
            <Text style={styles.subtitle}>Sign in to view your children's school information.</Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>Registered email</Text>
            <View style={styles.inputContainer}><Ionicons name="mail-outline" size={20} color={Colors.textSecondary} /><TextInput style={styles.input} placeholder="parent@example.com" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" editable={!loading} returnKeyType="next" /></View>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}><Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} /><TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} editable={!loading} onSubmitEditing={handleLogin} /><TouchableOpacity onPress={() => setShowPassword((value) => !value)}><Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.textSecondary} /></TouchableOpacity></View>
            <TouchableOpacity style={styles.forgot} onPress={handleForgotPassword}><Text style={styles.forgotText}>Forgot password?</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.loginButton, loading && { opacity: 0.65 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>{loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.loginText}>Sign In</Text>}</TouchableOpacity>
            <View style={styles.registerRow}><Text style={styles.noAccount}>Don't have an account?</Text><TouchableOpacity onPress={() => router.push('/(auth)/register')}><Text style={styles.registerText}> Register</Text></TouchableOpacity></View>
          </View>
          <View style={styles.notice}><Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} /><Text style={styles.noticeText}>Your children appear after the school administrator links your account to their student records.</Text></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  backButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  header: { alignItems: 'center', marginTop: 16 },
  crest: { width: 130, height: 130, marginBottom: 10 },
  schoolName: { color: Colors.primary, fontSize: 14, fontWeight: '900', textAlign: 'center', letterSpacing: 0.4 },
  title: { color: Colors.textDark, fontSize: 25, fontWeight: '800', marginTop: 28 },
  subtitle: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 7, maxWidth: 300 },
  form: { marginTop: 28 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.text, marginBottom: 8, marginTop: 12 },
  inputContainer: { minHeight: 52, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: 13, backgroundColor: Colors.white },
  input: { flex: 1, color: Colors.text, fontSize: 14, paddingVertical: 12 },
  forgot: { alignSelf: 'flex-end', marginTop: 12, padding: 4 },
  forgotText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  loginButton: { minHeight: 53, backgroundColor: Colors.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  loginText: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  noAccount: { color: Colors.textSecondary, fontSize: 13 },
  registerText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 13, backgroundColor: Colors.primaryLight, marginTop: 26 },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 17, color: Colors.textDark },
});
