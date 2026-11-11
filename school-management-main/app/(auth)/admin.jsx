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
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';



export default function AdminLoginScreen() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        'Missing Information',
        'Please enter your email and password.'
      );
      return;
    }

    try {
      // 1. Authenticate the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      // 2. Get the user's Firestore document
      const userDoc = await getDoc(
        doc(db, 'users', firebaseUser.uid)
      );

      // 3. Make sure the user document exists
      if (!userDoc.exists()) {
        await signOut(auth);

        Alert.alert(
          'Access Denied',
          'No user profile was found.'
        );

        return;
      }

      // 4. Get user data
      const userData = userDoc.data();

      // 5. Check role
      if (userData.role !== 'admin') {
        await signOut(auth);

        Alert.alert(
          'Access Denied',
          'Only administrators can access this portal.'
        );

        return;
      }

      // 6. User is an admin
      router.replace('/(admin)');

    } catch (error) {

      Alert.alert(
        'Login Failed',
        error?.message || 'Please check your credentials.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Back */}
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

            <View style={styles.securityIcon}>

              <Ionicons
                name="shield-checkmark"
                size={38}
                color={Colors.primary}
              />

            </View>

            <Image
              source={require('../../assets/images/crest.png')}
              style={styles.crest}
              resizeMode="contain"
            />

            <Text style={styles.title}>
              Administrator
            </Text>

            <Text style={styles.subtitle}>
              Secure school administration portal
            </Text>

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
              placeholder="Administrator Email"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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


          {/* Forgot */}
          <TouchableOpacity
            style={styles.forgot}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>


          {/* Login */}
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.85}
            onPress={handleLogin}
          >

            <Ionicons
              name="lock-open-outline"
              size={19}
              color={Colors.white}
            />

            <Text style={styles.loginText}>
              Secure Sign In
            </Text>

          </TouchableOpacity>


          {/* Security warning */}
          <View style={styles.securityNotice}>

            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={Colors.primary}
            />

            <View style={styles.noticeContent}>

              <Text style={styles.noticeTitle}>
                Restricted Access
              </Text>

              <Text style={styles.noticeText}>
                Administrator accounts are created and
                managed by authorized school personnel.
              </Text>

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

  content: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },

  backButton: {
    width: 42,
    height: 42,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },

  securityIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  crest: {
    width: 105,
    height: 105,
    marginBottom: 8,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: Colors.primary,
  },

  subtitle: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },

  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    color: Colors.text,
    fontSize: 15,
  },

  forgot: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },

  forgotText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  loginButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },

  loginText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },

  securityNotice: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 15,
    marginTop: 25,
  },

  noticeContent: {
    flex: 1,
    marginLeft: 10,
  },

  noticeTitle: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 3,
  },

  noticeText: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
  },

});