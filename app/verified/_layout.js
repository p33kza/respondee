import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet, Text } from 'react-native';
import HomeScreen from './index';
import NotificationScreen from './notification';
import ComplaintScreen from './complaint';
import HistoryScreen from './history';
import AccountScreen from './account';

const Tab = createBottomTabNavigator();

export default function Layout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FE712D',
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tab.Screen
        name="index"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="notification"
        component={NotificationScreen}
        options={{
          tabBarLabel: 'Notification',
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications-outline" size={22} color={color} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="complaint"
        component={ComplaintScreen}
        options={{
          tabBarLabel: 'Complain/Request',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.middleIconWrapper}>
              <MaterialCommunityIcons
                name="account-alert-outline"
                size={28}
                color="#fff"
              />
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      {/* <Tab.Screen
        name="history"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" size={22} color={color} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="account"
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
