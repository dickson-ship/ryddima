import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { Redirect } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRoleGuard } from '@/hooks/use-role-guard';
import { Colors } from '@/constants/colors';

export default function AdminLayout() {
  const { loading, user, allowed } = useRoleGuard('admin');
  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!user || !allowed) return <Redirect href="/(auth)" />;
  return <Drawer screenOptions={{ headerTintColor: Colors.primary, drawerActiveBackgroundColor: Colors.primaryLight, drawerActiveTintColor: Colors.primary, drawerInactiveTintColor: Colors.textSecondary, drawerLabelStyle: { fontSize: 15, fontWeight: '600' } }}>
    <Drawer.Screen name="(tabs)" options={{ drawerLabel: 'Dashboard', title: 'Dashboard', drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="monitor-dashboard" size={size || 24} color={color} /> }} />
  </Drawer>;
}
