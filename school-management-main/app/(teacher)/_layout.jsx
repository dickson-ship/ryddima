import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useRoleGuard } from '@/hooks/use-role-guard';

export default function TeacherLayout() {
  const { loading, user, allowed } = useRoleGuard('teacher');
  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!user || !allowed) return <Redirect href="/(auth)" />;
  return <Tabs screenOptions={{ tabBarActiveTintColor: Colors.primary, headerShown: false, tabBarButton: HapticTab }}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons size={24} name="home" color={color} /> }} />
    <Tabs.Screen name="students" options={{ title: 'Students', tabBarIcon: ({ color }) => <Ionicons size={24} name="people" color={color} /> }} />
    <Tabs.Screen name="attendance" options={{ title: 'Attendance', tabBarIcon: ({ color }) => <Ionicons size={24} name="time" color={color} /> }} />
    <Tabs.Screen name="academics" options={{ title: 'Academics', tabBarIcon: ({ color }) => <Ionicons size={24} name="book" color={color} /> }} />
  </Tabs>;
}
