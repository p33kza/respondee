import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

// Screens
import HomeScreen from './index';
import NotificationScreen from './notification';
import ComplaintScreen from './complaint';
import HistoryScreen from './history';
import AccountScreen from './account';
import RequestScreen from './request'; // ✅ additional screen

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FE712D',
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      {/* Tab Screens */}
      <Tab.Screen name="index" component={HomeScreen} options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />
      }} />
      {/* <Tab.Screen name="notification" component={NotificationScreen} options={{
        tabBarLabel: 'Notification',
        tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={22} color={color} />
      }} /> */}
      <Tab.Screen name="complaint" component={ComplaintScreen} options={{
        tabBarLabel: '',
        tabBarIcon: ({ color }) => (
          <View style={styles.middleIconWrapper}>
            <MaterialCommunityIcons name="account-alert-outline" size={28} color="#fff" />
          </View>
        )
      }} />
      {/* <Tab.Screen name="history" component={HistoryScreen} options={{
        tabBarLabel: 'History',
        tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={22} color={color} />
      }} /> */}
      <Tab.Screen name="account" component={AccountScreen} options={{
        tabBarLabel: 'Account',
        tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />
      }} />
    </Tab.Navigator>
  );
}

// ✅ FINAL EXPORT GOES HERE
export default function Layout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="complaint" component={ComplaintScreen} />
      <Stack.Screen name="request" component={RequestScreen} />
      <Stack.Screen name="status" component={RequestScreen} />
      <Stack.Screen name="responses" component={RequestScreen} />
      <Stack.Screen name="map" component={RequestScreen} />
      <Stack.Screen name="analytics" component={RequestScreen} />
      <Stack.Screen name="faq" component={RequestScreen} />
      <Stack.Screen name="feedback" component={RequestScreen} />
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
