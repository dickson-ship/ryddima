import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {Colors} from '../../constants/colors';
import { router } from 'expo-router';

export default function RoleSelectionScreen() {

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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

          <Image
            source={require('../../assets/images/crest.png')}
            style={styles.crest}
            resizeMode="contain"
          />

          <Text style={styles.title}>
            Who are you?
          </Text>

          <Text style={styles.subtitle}>
            Select your account type to continue
          </Text>

        </View>


        {/* Parent */}
        <TouchableOpacity
          style={styles.roleCard}
          activeOpacity={0.8}
          onPress={() =>
            router.push('/parent')
          }
        >

          <View
            style={[
              styles.iconContainer,
              styles.parentIcon,
            ]}
          >
            <Ionicons
              name="people-outline"
              size={30}
              color={Colors.parent}
            />
          </View>

          <View style={styles.roleInfo}>

            <Text style={styles.roleTitle}>
              Parent
            </Text>

            <Text style={styles.roleDescription}>
              Manage your child's academic activities,
              fees, attendance and school information.
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={Colors.textMuted}
          />

        </TouchableOpacity>


        {/* Teacher */}
        <TouchableOpacity
          style={styles.roleCard}
          activeOpacity={0.8}
          onPress={() =>
            router.push('/(auth)/teacher')
          }
        >

          <View
            style={[
              styles.iconContainer,
              styles.teacherIcon,
            ]}
          >
            <Ionicons
              name="school-outline"
              size={30}
              color={Colors.teacher}
            />
          </View>

          <View style={styles.roleInfo}>

            <Text style={styles.roleTitle}>
              Teacher
            </Text>

            <Text style={styles.roleDescription}>
              Manage classes, attendance, assignments,
              results and student activities.
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={Colors.textMuted}
          />

        </TouchableOpacity>


        {/* Admin */}
        <TouchableOpacity
          style={styles.roleCard}
          activeOpacity={0.8}
          onPress={() =>
            router.push('/(auth)/admin')
          }
        >

          <View
            style={[
              styles.iconContainer,
              styles.adminIcon,
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={30}
              color={Colors.admin}
            />
          </View>

          <View style={styles.roleInfo}>

            <Text style={styles.roleTitle}>
              Administrator
            </Text>

            <Text style={styles.roleDescription}>
              Manage the school, staff, students,
              finances and academic activities.
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={Colors.textMuted}
          />

        </TouchableOpacity>


        {/* Security notice */}
        <View style={styles.notice}>

          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={Colors.warning}
          />

          <Text style={styles.noticeText}>
            Access to school administration and teacher
            accounts is controlled by the school.
          </Text>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 30,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  header: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 30,
  },

  crest: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },

  title: {
    fontSize: 29,
    fontWeight: '800',
    color: Colors.primary,
  },

  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 7,
    textAlign: 'center',
  },

  roleCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 17,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: Colors.border,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 2,
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  parentIcon: {
    backgroundColor: '#E8F5EF',
  },

  teacherIcon: {
    backgroundColor: '#E8F0FA',
  },

  adminIcon: {
    backgroundColor: Colors.primaryLight,
  },

  roleInfo: {
    flex: 1,
    paddingRight: 8,
  },

  roleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },

  roleDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.textSecondary,
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: 13,
    padding: 14,
    marginTop: 8,
  },

  noticeText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.primaryDark,
  },

});