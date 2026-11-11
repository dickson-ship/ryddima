// app/(parent)/children.jsx

import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '@/constants/colors';
import { useParentPortal } from '@/hooks/use-parent-portal';
import {
  EmptyState,
  initials,
  studentName,
} from '@/components/parent/ParentScreen';

export default function ParentChildren() {
  const {
    children,
    loading,
    refreshing,
    error,
    reload,
  } = useParentPortal();

  const [search, setSearch] = useState('');

  const filteredChildren = children.filter((child) => {
    const term = search.toLowerCase().trim();

    if (!term) return true;

    return [
      studentName(child),
      child.className,
      child.class,
      child.admissionNumber,
    ].some((value) => String(value || '').toLowerCase().includes(term));
  });

  const openScreen = (screen, child) => {
    router.push({
      pathname: `/(parent)/${screen}`,
      params: { studentId: child.id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => reload(true)}
            tintColor={Colors.primary}
          />
        }
      >
        <Text style={styles.eyebrow}>RYDIMMA EDUCATIONAL COMPLEX</Text>
        <Text style={styles.title}>My Children</Text>
        <Text style={styles.subtitle}>
          View your children's school information.
        </Text>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.textMuted}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, class or admission number"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={19}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.countRow}>
          <Text style={styles.sectionTitle}>Linked students</Text>
          <Text style={styles.count}>{filteredChildren.length}</Text>
        </View>

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.stateText}>Loading children...</Text>
          </View>
        ) : error ? (
          <View style={styles.state}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={Colors.danger}
            />
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => reload()}
            >
              <Text style={styles.buttonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredChildren.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title={children.length ? 'No matching children' : 'No children linked'}
            message={
              children.length
                ? 'Try searching with a different name or admission number.'
                : 'Please ask the school administrator to link your account to your child.'
            }
          />
        ) : (
          filteredChildren.map((child) => (
            <View key={child.id} style={styles.card}>
              <TouchableOpacity
                style={styles.childHeader}
                onPress={() => openScreen('student', child)}
                activeOpacity={0.8}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(child)}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.childName}>{studentName(child)}</Text>
                  <Text style={styles.childClass}>
                    {child.className || child.class || 'Class not assigned'}
                  </Text>
                  <Text style={styles.admission}>
                    Admission no.: {child.admissionNumber || 'Not recorded'}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.action}
                  onPress={() => openScreen('attendance', child)}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={19}
                    color={Colors.primary}
                  />
                  <Text style={styles.actionText}>Attendance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.action}
                  onPress={() => openScreen('results', child)}
                >
                  <Ionicons
                    name="school-outline"
                    size={19}
                    color={Colors.primary}
                  />
                  <Text style={styles.actionText}>Results</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.action}
                  onPress={() => openScreen('fees', child)}
                >
                  <Ionicons
                    name="wallet-outline"
                    size={19}
                    color={Colors.primary}
                  />
                  <Text style={styles.actionText}>Fees</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 18, paddingBottom: 30 },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.primary,
    fontWeight: '900',
  },
  title: {
    color: Colors.textDark,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 20,
  },
  searchBox: {
    minHeight: 49,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  searchInput: {
    flex: 1,
    color: Colors.textDark,
    fontSize: 12,
    paddingVertical: 11,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 13,
  },
  sectionTitle: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '900',
  },
  count: {
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    overflow: 'hidden',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '900',
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 17,
    padding: 14,
    marginBottom: 13,
  },
  childHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.primary, fontWeight: '900', fontSize: 14 },
  childName: { color: Colors.textDark, fontSize: 14, fontWeight: '900' },
  childClass: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  admission: { color: Colors.textSecondary, fontSize: 10, marginTop: 4 },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 14,
    marginBottom: 12,
  },
  actions: { flexDirection: 'row', gap: 7 },
  action: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  actionText: { color: Colors.primary, fontSize: 10, fontWeight: '800' },
  state: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stateText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 13,
  },
  buttonText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
});