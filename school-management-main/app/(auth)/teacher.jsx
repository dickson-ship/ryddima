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
import { auth, db } from '../../services/firebase';
import {getDoc, doc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { router } from 'expo-router';

export default function TeacherLoginScreen() {

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
        if (userData.role !== 'teacher') {
          await signOut(auth);
  
          Alert.alert(
            'Access Denied',
            'Only teachers can access this portal.'
          );
  
          return;
        }
  
        // 6. User is an admin
      router.replace('/(teacher)');
  
      } catch (error) {
  
        Alert.alert(
          'Login Failed',
          'Please check your credentials.'
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

            <Image
              source={require('../../assets/images/crest.png')}
              style={styles.crest}
              resizeMode="contain"
            />

            <Text style={styles.title}>
              Teacher Login
            </Text>

            <Text style={styles.subtitle}>
              Sign in with your school account
            </Text>

          </View>


          {/* Staff ID */}
          <View style={styles.inputContainer}>

            <Ionicons
              name="id-card-outline"
              size={21}
              color={Colors.textSecondary}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
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


          {/* Forgot password */}
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
            <Text style={styles.loginText}>
              Sign In
            </Text>
          </TouchableOpacity>


          {/* Information */}
          <View style={styles.info}>

            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Colors.teacher}
            />

            <Text style={styles.infoText}>
              Teacher accounts are created or invited
              by the school administrator.
            </Text>

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
    marginTop: 15,
    marginBottom: 35,
  },

  crest: {
    width: 135,
    height: 135,
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.teacher,
  },

  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
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
    color: Colors.teacher,
    fontWeight: '600',
    fontSize: 14,
  },

  loginButton: {
    height: 56,
    backgroundColor: Colors.teacher,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },

  info: {
    flexDirection: 'row',
    backgroundColor: '#E8F0FA',
    borderRadius: 13,
    padding: 14,
    marginTop: 25,
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    color: Colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
  },

});