// app/(parent)/payments.jsx

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useFocusEffect } from 'expo-router';

import { db } from '@/services/firebase';
import { Colors } from '@/constants/colors';
import { useParentPortal } from '@/hooks/use-parent-portal';
import {
  EmptyState,
  studentName,
} from '@/components/parent/ParentScreen';

const money = (value) =>
  `GH₵ ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function formatDate(value) {
  if (!value) return 'Date not recorded';

  let date = value;

  if (typeof value?.toDate === 'function') {
    date = value.toDate();
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function normaliseStatus(status) {
  return String(status || 'recorded').toLowerCase().trim();
}

export default function ParentPayments() {
  const { children, loading: childrenLoading } = useParentPortal();

  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadPayments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoadingPayments(true);

    setError('');

    try {
      const allPayments = [];

      // Read records only for children already linked to this parent.
      for (const child of children) {
        const paymentQuery = query(
          collection(db, 'payments'),
          where('studentId', '==', child.id)
        );

        const snapshot = await getDocs(paymentQuery);

        snapshot.docs.forEach((paymentDoc) => {
          const data = paymentDoc.data();

          allPayments.push({
            id: paymentDoc.id,
            ...data,
            studentId: child.id,
            studentName: studentName(child),
          });
        });
      }

      allPayments.sort((a, b) => {
        const dateValue = (item) => {
          const value = item.paymentDate || item.createdAt;
          if (typeof value?.toDate === 'function') {
            return value.toDate().getTime();
          }
          const parsed = new Date(value || 0).getTime();
          return Number.isNaN(parsed) ? 0 : parsed;
        };

        return dateValue(b) - dateValue(a);
      });

      setPayments(allPayments);
    } catch (err) {
      console.error('Parent payments load error:', err);
      setError(
        'Unable to load payment records. Check your Firestore payments rules and try again.'
      );
    } finally {
      setLoadingPayments(false);
      setRefreshing(false);
    }
  }, [children]);

  useFocusEffect(
    useCallback(() => {
      if (!childrenLoading) {
        loadPayments();
      }
    }, [childrenLoading, loadPayments])
  );

  const totalRecorded = payments.reduce((sum, payment) => {
    const status = normaliseStatus(payment.status);

    // Only count payments that have been confirmed/recorded.
    if (['pending', 'failed', 'rejected', 'cancelled'].includes(status)) {
      return sum;
    }

    return sum + Number(payment.amount || 0);
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPayments(true)}
            tintColor={Colors.primary}
          />
        }
      >
        <Text style={styles.eyebrow}>RYDIMMA EDUCATIONAL COMPLEX</Text>
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.subtitle}>
          Review the school payments recorded for your children.
        </Text>

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
              Total recorded payments
            </Text>
            <Text style={styles.summaryAmount}>
              {money(totalRecorded)}
            </Text>
            <Text style={styles.summaryHint}>
              Based on the payment records currently available
            </Text>
          </View>
        </View>

        <View style={styles.listHeading}>
          <Text style={styles.sectionTitle}>Payment history</Text>
          <Text style={styles.recordCount}>
            {payments.length} {payments.length === 1 ? 'record' : 'records'}
          </Text>
        </View>

        {childrenLoading || loadingPayments ? (
          <View style={styles.state}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.stateText}>Loading payment history...</Text>
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
              style={styles.retryButton}
              onPress={() => loadPayments()}
            >
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : children.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No linked children"
            message="Payment records will appear after the school links your account to your children."
          />
        ) : payments.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No payments recorded"
            message="There are no payment transactions recorded for your linked children yet. Contact the school office if you believe a payment is missing."
          />
        ) : (
          payments.map((payment) => {
            const status = normaliseStatus(payment.status);
            const isPending = ['pending', 'processing'].includes(status);
            const isFailed = ['failed', 'rejected', 'cancelled'].includes(status);

            return (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentTop}>
                  <View style={styles.paymentIcon}>
                    <Ionicons
                      name="receipt-outline"
                      size={21}
                      color={Colors.primary}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>
                      {payment.studentName || 'Student'}
                    </Text>
                    <Text style={styles.paymentDate}>
                      {formatDate(payment.paymentDate || payment.createdAt)}
                    </Text>
                  </View>

                  <Text style={styles.amount}>{money(payment.amount)}</Text>
                </View>

                <View style={styles.divider} />

                <InfoRow
                  label="Payment method"
                  value={payment.method || 'Not recorded'}
                />

                <InfoRow
                  label="Reference"
                  value={payment.reference || 'Not recorded'}
                />

                <View style={styles.statusRow}>
                  <Text style={styles.label}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      isPending && styles.pendingBadge,
                      isFailed && styles.failedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isPending && styles.pendingText,
                        isFailed && styles.failedText,
                      ]}
                    >
                      {status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        <Text style={styles.notice}>
          This screen shows recorded payment information only. It does not
          accept or process online payments.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {String(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 18, paddingBottom: 30 },
  eyebrow: {
    color: Colors.primary,
    fontSize: 9,
    letterSpacing: 1,
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
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 17,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
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
  summaryLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },
  summaryAmount: {
    color: Colors.primary,
    fontSize: 23,
    fontWeight: '900',
    marginTop: 5,
  },
  summaryHint: { color: Colors.textSecondary, fontSize: 10, marginTop: 4 },
  listHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  sectionTitle: { color: Colors.textDark, fontSize: 16, fontWeight: '900' },
  recordCount: { color: Colors.textSecondary, fontSize: 11 },
  paymentCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 17,
    padding: 14,
    marginBottom: 12,
  },
  paymentTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: { color: Colors.textDark, fontSize: 12, fontWeight: '900' },
  paymentDate: { color: Colors.textSecondary, fontSize: 10, marginTop: 4 },
  amount: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '900',
    maxWidth: 120,
    textAlign: 'right',
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 7,
  },
  label: { color: Colors.textSecondary, fontSize: 11 },
  infoValue: {
    color: Colors.textDark,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  pendingBadge: { backgroundColor: '#FEF3C7' },
  pendingText: { color: '#92400E' },
  failedBadge: { backgroundColor: '#FEE2E2' },
  failedText: { color: Colors.danger },
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
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  retryText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  notice: {
    color: Colors.textSecondary,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 13,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 8,
  },
});