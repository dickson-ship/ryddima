import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export function StudentCard({ student, onPress, onLinkParent }) {
  const firstName = student.firstName || '';
  const lastName = student.lastName || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'S';
  const isLinked = Boolean(student.parentUid);

  return (
    <View style={styles.studentCard}>
      <TouchableOpacity style={styles.studentMain} onPress={onPress} activeOpacity={0.75}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName} numberOfLines={1}>{`${firstName} ${lastName}`.trim() || 'Unnamed student'}</Text>
          <Text style={styles.admissionNumber}>{student.admissionNumber || 'No admission number'}</Text>
          <View style={styles.metaRow}>
            <View style={styles.classBadge}><Text style={styles.classBadgeText}>{student.className || student.class || 'Class not set'}</Text></View>
            {!!student.gender && <Text style={styles.gender}>{student.gender}</Text>}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.cardRight}>
        <View style={[styles.statusBadge, !isLinked && styles.unlinkedBadge]}>
          <View style={[styles.statusDot, !isLinked && styles.unlinkedDot]} />
          <Text style={[styles.statusText, !isLinked && styles.unlinkedText]}>{isLinked ? 'Parent linked' : 'Not linked'}</Text>
        </View>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={onLinkParent}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`${isLinked ? 'Manage parent link for' : 'Link parent to'} ${firstName} ${lastName}`}
        >
          <Ionicons name={isLinked ? 'people' : 'person-add-outline'} size={16} color={Colors.primary} />
          <Text style={styles.linkButtonText}>{isLinked ? 'Manage' : 'Link Parent'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPress} style={styles.profileButton} accessibilityLabel={`Open ${firstName} ${lastName} profile`}>
          <Ionicons name="chevron-forward" size={17} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function EmptyState({ title = 'No students found', message = 'Try changing your search or class filter.' }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><Ionicons name="people-outline" size={34} color={Colors.primary} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  studentCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 13, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 8 },
  studentMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 15, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  studentInfo: { flex: 1, minWidth: 0, marginLeft: 10, marginRight: 5 },
  studentName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  admissionNumber: { marginTop: 3, fontSize: 11, color: Colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 6 },
  classBadge: { backgroundColor: Colors.primaryLight, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4 },
  classBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  gender: { marginLeft: 8, fontSize: 10, color: Colors.textSecondary },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center', gap: 7 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4 },
  unlinkedBadge: { backgroundColor: '#FEF3C7' },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.success, marginRight: 5 },
  unlinkedDot: { backgroundColor: '#B45309' },
  statusText: { fontSize: 9, fontWeight: '700', color: Colors.success },
  unlinkedText: { color: '#92400E' },
  linkButton: { minHeight: 30, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.primaryLight, backgroundColor: '#FFF9FA', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  linkButtonText: { color: Colors.primary, fontSize: 10, fontWeight: '800' },
  profileButton: { alignSelf: 'flex-end', paddingHorizontal: 8, paddingVertical: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 40 },
  emptyIcon: { width: 70, height: 70, borderRadius: 22, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 19 },
});
