import React from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

export function ParentScreen({ title, subtitle, loading, refreshing, error, onRefresh, children, scroll = true }) {
  const content = (
    <View style={styles.content}>
      <View style={styles.heading}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to parent dashboard" onPress={() => router.replace('/(parent)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>RYDIMMA EDUCATIONAL COMPLEX</Text>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {loading ? <View style={styles.stateCard}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.stateText}>Loading information...</Text></View>
        : error ? <View style={styles.stateCard}><Ionicons name="alert-circle-outline" size={32} color={Colors.danger} /><Text style={styles.stateTitle}>Unable to load this page</Text><Text style={styles.stateText}>{error}</Text><TouchableOpacity style={styles.primaryButton} onPress={() => onRefresh?.()}><Text style={styles.primaryButtonText}>Try again</Text></TouchableOpacity></View>
        : children}
    </View>
  );
  return <SafeAreaView style={styles.container}>{scroll ? <ScrollView showsVerticalScrollIndicator={false} refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={() => onRefresh(true)} tintColor={Colors.primary} /> : undefined}>{content}</ScrollView> : content}</SafeAreaView>;
}

export function ChildPicker({ children = [], selectedChild, onSelect }) {
  if (children.length <= 1) return selectedChild ? <View style={styles.selectedChild}><View style={styles.avatar}><Text style={styles.avatarText}>{initials(selectedChild)}</Text></View><View style={{ flex: 1 }}><Text style={styles.childName}>{studentName(selectedChild)}</Text><Text style={styles.childMeta}>{selectedChild.className || selectedChild.class || 'Class not assigned'} · {selectedChild.admissionNumber || 'No admission number'}</Text></View></View> : null;
  return <View style={styles.pickerWrap}><Text style={styles.fieldLabel}>SELECT CHILD</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 9 }}>
    {children.map((child) => <TouchableOpacity key={child.id} onPress={() => onSelect(child.id)} style={[styles.childChip, selectedChild?.id === child.id && styles.childChipActive]}><Text style={[styles.chipName, selectedChild?.id === child.id && styles.chipNameActive]}>{studentName(child)}</Text><Text style={[styles.chipClass, selectedChild?.id === child.id && styles.chipNameActive]}>{child.className || child.class || 'Class N/A'}</Text></TouchableOpacity>)}
  </ScrollView></View>;
}

export function EmptyState({ icon = 'document-text-outline', title, message }) {
  return <View style={styles.stateCard}><View style={styles.emptyIcon}><Ionicons name={icon} size={28} color={Colors.primary} /></View><Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateText}>{message}</Text></View>;
}

export function studentName(child) {
  return [child?.firstName, child?.otherName, child?.lastName].filter(Boolean).join(' ') || child?.name || 'Student';
}
export function initials(child) {
  return `${child?.firstName?.[0] || child?.name?.[0] || ''}${child?.lastName?.[0] || child?.otherName?.[0] || ''}`.toUpperCase() || 'S';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 34 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 }, backButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 9, letterSpacing: 1, color: Colors.primary, fontWeight: '900' }, title: { fontSize: 23, fontWeight: '900', color: Colors.textDark, marginTop: 4 }, subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  stateCard: { backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, padding: 24, alignItems: 'center', justifyContent: 'center', marginTop: 10 }, stateTitle: { fontSize: 15, color: Colors.textDark, fontWeight: '800', textAlign: 'center', marginTop: 10 }, stateText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 11, paddingHorizontal: 18, paddingVertical: 11, marginTop: 15 }, primaryButtonText: { color: Colors.white, fontWeight: '800', fontSize: 12 }, emptyIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  selectedChild: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, marginBottom: 18 }, avatar: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight }, avatarText: { color: Colors.primary, fontWeight: '900' }, childName: { color: Colors.textDark, fontSize: 14, fontWeight: '800' }, childMeta: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  pickerWrap: { marginBottom: 18 }, fieldLabel: { color: Colors.textSecondary, fontWeight: '900', fontSize: 10, letterSpacing: 0.7, marginBottom: 9 }, childChip: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 13, paddingVertical: 10, paddingHorizontal: 13, minWidth: 125 }, childChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary }, chipName: { color: Colors.textDark, fontSize: 12, fontWeight: '800' }, chipClass: { color: Colors.textSecondary, fontSize: 10, marginTop: 4 }, chipNameActive: { color: Colors.white },
});
