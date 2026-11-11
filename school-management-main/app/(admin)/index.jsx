import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useRoleGuard } from '@/hooks/use-role-guard';
import { Colors } from '@/constants/colors';

export default function AdminIndex() {
  const { loading, user, allowed } = useRoleGuard('admin');
  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!user || !allowed) return <Redirect href="/(auth)" />;
  return <Redirect href="/(admin)/(tabs)" />;
}
