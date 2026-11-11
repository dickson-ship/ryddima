// app/(parent)/index.jsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';

import { auth } from '@/services/firebase';
import { Colors } from '@/constants/colors';
import { useParentPortal } from '@/hooks/use-parent-portal';
import { fetchParentAttendance } from '@/services/parent/records';
import {
  EmptyState,
  initials,
  studentName,
} from '@/components/parent/ParentScreen';

const money = (amount) =>
  `GH₵ ${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function getBalance(student) {
  return Number(
    student?.stats?.feeBalance ??
      student?.feeBalance ??
      student?.fees?.balance ??
      Math.max(
        Number(
          student?.totalFees ??
            student?.fees?.total ??
            student?.stats?.totalFees ??
            0
        ) -
          Number(
            student?.amountPaid ??
              student?.fees?.paid ??
              student?.stats?.amountPaid ??
              0
          ),
        0
      )
  );
}

function attendanceStatus(record) {
  return String(record?.status || '').toLowerCase().trim();
}

export default function ParentDashboard() {
  const {
    profile,
    children,
    loading,
    refreshing,
    error,
    reload,
  } = useParentPortal();

  const [attendance, setAttendance] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const loadAttendance = useCallback(async () => {
    if (!children.length) {
      setAttendance({});
      return;
    }

    setAttendanceLoading(true);

    try {
      const results = await Promise.all(
        children.map(async (child) => {
          try {
            const records = await fetchParentAttendance(child.id);
            const present = records.filter((record) =>
              ['present', 'late'].includes(attendanceStatus(record))
            ).length;

            const absent = records.filter(
              (record) => attendanceStatus(record) === 'absent'
            ).length;

            const total = records.filter((record) =>
              ['present', 'late', 'absent'].includes(
                attendanceStatus(record)
              )
            ).length;

            return [
              child.id,
              {
                present,
                absent,
                total,
                percentage: total
                  ? Math.round((present / total) * 100)
                  : null,
              },
            ];
          } catch (err) {
            console.error(
              `Attendance load failed for student ${child.id}:`,
              err
            );

            return [
              child.id,
              {
                present: Number(child.stats?.attendance || 0),
                absent: 0,
                total: 0,
                percentage: null,
              },
            ];
          }
        })
      );

      setAttendance(Object.fromEntries(results));
    } finally {
      setAttendanceLoading(false);
    }
  }, [children]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const parentName =
    profile?.name || profile?.fullName || profile?.displayName || 'Parent';

  const totalOutstanding = children.reduce(
    (sum, child) => sum + getBalance(child),
    0
  );

  const handleRefresh = async () => {
    await reload(true);
    await loadAttendance();
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out of your parent account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (err) {
              Alert.alert(
                'Sign out failed',
                err?.message || 'Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const openChildScreen = (screen, child) => {
    router.push({
      pathname: `/(parent)/${screen}`,
      params: child ? { studentId: child.id } : {},
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || attendanceLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              RYDIMMA EDUCATIONAL COMPLEX
            </Text>
            <Text style={styles.title}>Parent Dashboard</Text>
            <Text style={styles.subtitle}>
              Welcome back, {parentName}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
            accessibilityLabel="Sign out"
          >
            <Ionicons
              name="log-out-outline"
              size={21}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="wallet-outline"
              size={25}
              color={Colors.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>
              Total outstanding fees
            </Text>
            <Text style={styles.summaryAmount}>
              {money(totalOutstanding)}
            </Text>
            <Text style={styles.summaryHint}>
              Combined balance for your linked children
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>My Children</Text>
            <Text style={styles.sectionSubtitle}>
              Attendance and outstanding fees
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>{children.length}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.stateText}>
              Loading your children's records...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={Colors.danger}
            />
            <Text style={styles.stateTitle}>
              Unable to load your dashboard
            </Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => reload()}
            >
              <Text style={styles.primaryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : children.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No children linked yet"
            message="Ask the school administrator to link your parent account to your child's student record."
          />
        ) : (
          children.map((child) => {
            const stats = attendance[child.id];
            const balance = getBalance(child);

            return (
              <View key={child.id} style={styles.childCard}>
                <TouchableOpacity
                  style={styles.childHeader}
                  onPress={() => openChildScreen('student', child)}
                  activeOpacity={0.75}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {initials(child)}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.childName}>
                      {studentName(child)}
                    </Text>
                    <Text style={styles.childMeta}>
                      {child.admissionNumber || 'Admission number unavailable'}
                    </Text>
                    <Text style={styles.className}>
                      {child.className || child.class || 'Class not assigned'}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>

                <View style={styles.metrics}>
                  <View style={styles.metric}>
                    <View style={styles.metricIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={Colors.primary}
                      />
                    </View>
                    <Text style={styles.metricLabel}>Attendance</Text>
                    <Text style={styles.metricValue}>
                      {stats?.percentage != null
                        ? `${stats.percentage}%`
                        : stats?.total
                          ? `${stats.present} present`
                          : `${Number(child.stats?.attendance || 0)} days`}
                    </Text>
                    <Text style={styles.metricHint}>
                      {stats?.total
                        ? `${stats.present} present · ${stats.absent} absent`
                        : 'Recorded attendance'}
                    </Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metric}>
                    <View style={styles.metricIcon}>
                      <Ionicons
                        name="wallet-outline"
                        size={18}
                        color={balance > 0 ? Colors.danger : Colors.success}
                      />
                    </View>
                    <Text style={styles.metricLabel}>Outstanding fees</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: balance > 0 ? Colors.danger : Colors.success },
                      ]}
                    >
                      {money(balance)}
                    </Text>
                    <Text style={styles.metricHint}>
                      {balance > 0 ? 'Balance remaining' : 'No balance recorded'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openChildScreen('attendance', child)}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={17}
                      color={Colors.primary}
                    />
                    <Text style={styles.actionText}>Attendance</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openChildScreen('results', child)}
                  >
                    <Ionicons
                      name="school-outline"
                      size={17}
                      color={Colors.primary}
                    />
                    <Text style={styles.actionText}>Results</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openChildScreen('fees', child)}
                  >
                    <Ionicons
                      name="receipt-outline"
                      size={17}
                      color={Colors.primary}
                    />
                    <Text style={styles.actionText}>Fees</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <TouchableOpacity
          style={styles.paymentsLink}
          onPress={() => router.navigate('/(parent)/payments')}
        >
          <View style={styles.paymentsIcon}>
            <Ionicons
              name="wallet-outline"
              size={23}
              color={Colors.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.paymentsTitle}>Payments</Text>
            <Text style={styles.paymentsSubtitle}>
              View recorded payments for your children
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={Colors.textMuted}
          />
        </TouchableOpacity>

        <Text style={styles.footer}>
          Student information is available only for children linked to your
          authenticated parent account.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    gap: 12,
  },
  headerText: { flex: 1 },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.primary,
    fontWeight: '900',
  },
  title: {
    fontSize: 25,
    color: Colors.textDark,
    fontWeight: '900',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  signOutButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: Colors.primaryLight,
    borderRadius: 19,
    padding: 17,
    marginBottom: 25,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  summaryAmount: {
    fontSize: 23,
    color: Colors.primary,
    fontWeight: '900',
    marginTop: 4,
  },
  summaryHint: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.textDark,
    fontWeight: '900',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  countBadge: {
    minWidth: 31,
    height: 31,
    borderRadius: 11,
    paddingHorizontal: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { color: Colors.primary, fontWeight: '900', fontSize: 12 },
  childCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 19,
    padding: 14,
    marginBottom: 14,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.primary, fontSize: 14, fontWeight: '900' },
  childName: { color: Colors.textDark, fontSize: 14, fontWeight: '900' },
  childMeta: { color: Colors.textSecondary, fontSize: 10, marginTop: 4 },
  className: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  metrics: {
    flexDirection: 'row',
    marginTop: 15,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  metric: { flex: 1, alignItems: 'center', paddingHorizontal: 3 },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 7,
    textAlign: 'center',
  },
  metricValue: {
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 5,
    textAlign: 'center',
  },
  metricHint: {
    color: Colors.textMuted,
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 5,
  },
  actions: { flexDirection: 'row', gap: 7, marginTop: 12 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  actionText: { color: Colors.primary, fontSize: 10, fontWeight: '800' },
  stateCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginTop: 10,
  },
  stateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 11,
    marginTop: 14,
  },
  primaryButtonText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  paymentsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    marginTop: 7,
  },
  paymentsIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentsTitle: { color: Colors.textDark, fontSize: 13, fontWeight: '900' },
  paymentsSubtitle: { color: Colors.textSecondary, fontSize: 10, marginTop: 4 },
  footer: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 22,
  },
});