import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet, Alert } from 'react-native';
import React, { useCallback } from 'react';
import { useUser } from '../../hooks/useUsers';
import { useFocusEffect } from '@react-navigation/native';

import HomeScreen from './index';
import NotificationScreen from './notification';
import ComplaintScreen from './complaint';
import AccountScreen from './account';
import TrackScreen from './track';
import ResponseScreen from './responses';
import SelectRequestTypeScreen from './request-selection';
import LogisticsScreen from './logistics';
import LogisticsDetailView from './logisticsView';
import LogisticsMessageView from './MessageView';
import ComplaintsDetailView from './complaintsView';
import MessageView from './MessageView';
import AboutScreen from './about';
import { useStoredUser } from '../../hooks/useStoredUser';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const user = useStoredUser();
  const { data: dbUser, refetch } = useUser(user?.id);
  const isAdminVerified = Boolean(dbUser?.adminVerified ?? user?.adminVerified);

  useFocusEffect(
    useCallback(() => {
      refetch?.();
      const id = setInterval(() => refetch?.(), 5000);
      return () => clearInterval(id);
    }, [refetch])
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FE712D',
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        listeners={{
          tabPress: e => {
            if (!isAdminVerified) {
              e.preventDefault();
              Alert.alert(
                "Preview Only",
                "Your account is not yet verified by the admin."
              );
            }
          }
        }}
        options={{
          tabBarLabel: 'Notification',
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications-outline" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SelectRequest"
        component={SelectRequestTypeScreen}
        listeners={{
          tabPress: e => {
            if (!isAdminVerified) {
              e.preventDefault();
              Alert.alert(
                "Access Denied",
                "Your account is not yet verified by the admin."
              );
            }
          }
        }}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.middleIconWrapper}>
              <MaterialCommunityIcons name="plus" size={28} color="#fff" />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Track"
        component={TrackScreen}
        listeners={{
          tabPress: e => {
            if (!isAdminVerified) {
              e.preventDefault();
              Alert.alert(
                "Access Denied",
                "Your account is not yet verified by the admin."
              );
            }
          }
        }}
        options={{
          tabBarLabel: 'My Requests',
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text-outline" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Layout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="complaint" component={ComplaintScreen} />
      <Stack.Screen name="logistics" component={LogisticsScreen} />
      <Stack.Screen name="logisticsView" component={LogisticsDetailView} />
      <Stack.Screen name="complaintsView" component={ComplaintsDetailView} />
      <Stack.Screen name="MessageView" component={MessageView} />
      <Stack.Screen name="track" component={TrackScreen} />
      <Stack.Screen name="about" component={AboutScreen} />
      <Stack.Screen name="responses" component={ResponseScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFBFC',
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
    borderTopColor: '#ddd',
    position: 'absolute',
  },
  middleIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FE712D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
