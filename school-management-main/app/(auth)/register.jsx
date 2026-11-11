import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {Colors} from '../../constants/colors';
import { router } from 'expo-router';
import { auth, db } from '../../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function RegisterScreen() {

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [accepted, setAccepted] = useState(false);

  const handleRegister = async () => {

    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Missing Information',
        'Please complete all fields.'
      );

      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least 6 characters.'
      );

      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password Error',
        'Passwords do not match.'
      );

      return;
    }

    if (!accepted) {
      Alert.alert(
        'Terms Required',
        'Please accept the Terms of Service and Privacy Policy.'
      );

      return;
    }

    try {
       const normalizedEmail = email.trim().toLowerCase();
       const cleanName = fullName.trim();
       const cleanPhone = phone.trim();
       const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
       const uid = userCredential.user.uid;
       await setDoc(doc(db, 'users', uid), {
        uid,
        name: cleanName,
        fullName: cleanName,
        email: normalizedEmail,
        emailLowercase: normalizedEmail,
        phone: cleanPhone,
        role: 'parent',
        createdAt: serverTimestamp(),
       });
       Alert.alert('Registration successful', 'Your parent account has been created. You can now access the parent dashboard.', [{ text: 'Continue', onPress: () => router.replace('/(parent)') }]);
    } catch (error) {
      console.error('Parent registration failed:', error);
      const message = error?.code === 'auth/email-already-in-use'
        ? 'An account already exists for this email. Please sign in instead.'
        : error?.code === 'auth/invalid-email'
        ? 'Enter a valid email address.'
        : error?.message || 'Please try again.';
      Alert.alert('Registration failed', message);
    }

  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.text}
            />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>

            <Text style={styles.title}>
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Join the Rydimma community
            </Text>

            <Image
              source={require('../../assets/images/crest.png')}
              style={styles.crest}
              resizeMode="contain"
            />

          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* Full Name */}
            <View style={styles.inputContainer}>

              <Ionicons
                name="person-outline"
                size={21}
                color={Colors.textSecondary}
              />

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />

            </View>

            {/* Email */}
            <View style={styles.inputContainer}>

              <Ionicons
                name="mail-outline"
                size={21}
                color={Colors.textSecondary}
              />

              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>

              <Ionicons
                name="call-outline"
                size={21}
                color={Colors.textSecondary}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={Colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

            </View>

            {/* Password */}
            <View style={styles.inputContainer}>

              <Ionicons
                name="lock-closed-outline"
                size={21}
                color={Colors.textSecondary}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(!showPassword)
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  size={21}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>

            </View>

            {/* Confirm password */}
            <View style={styles.inputContainer}>

              <Ionicons
                name="lock-closed-outline"
                size={21}
                color={Colors.textSecondary}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                <Ionicons
                  name={
                    showConfirmPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  size={21}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>

            </View>

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAccepted(!accepted)}
              activeOpacity={0.8}
            >

              <View
                style={[
                  styles.checkbox,
                  accepted && styles.checkboxActive,
                ]}
              >

                {accepted && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={Colors.white}
                  />
                )}

              </View>

              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.link}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={styles.link}>
                  Privacy Policy
                </Text>
              </Text>

            </TouchableOpacity>

            {/* Register button */}
            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.8}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>
                Create Account
              </Text>
            </TouchableOpacity>

            {/* Login */}
            <View style={styles.loginContainer}>

              <Text style={styles.loginText}>
                Already have an account?
              </Text>

              <TouchableOpacity
                onPress={() => router.replace('/(auth)/parent')}
              >
                <Text style={styles.loginLink}>
                  Sign In
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 35,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  header: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: Colors.primary,
  },

  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 5,
  },

  crest: {
    width: 145,
    height: 145,
    marginTop: 10,
  },

  form: {
    width: '100%',
  },

  inputContainer: {
    height: 55,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: Colors.white,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    color: Colors.text,
    fontSize: 15,
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
    marginBottom: 20,
  },

  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    marginTop: 1,
  },

  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  termsText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },

  link: {
    color: Colors.primary,
    fontWeight: '600',
  },

  registerButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  registerButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },

  loginText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  loginLink: {
    color: Colors.primary,
    fontWeight: '700',
    marginLeft: 5,
    fontSize: 14,
  },

});