import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

export default function AccountScreen() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={64} color="#3E4A5A" />
        <View>
          <Text style={styles.nameText}>Hi, Name</Text>
          <Text style={styles.phoneText}>+6392225555100</Text>
          <Text style={styles.verifyText}>Verify your account</Text>
        </View>
      </View>

      {/* Spacer to push menu items down */}
      <View style={{ height: 24 }} />

      {/* Menu List */}
      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="help-circle" size={20} color="#3E4A5A" />
          <Text style={styles.menuText}>FAQs</Text>
          <Feather name="chevron-right" size={20} color="#3E4A5A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Feather name="info" size={20} color="#3E4A5A" />
          <Text style={styles.menuText}>ABOUT Respondee</Text>
          <Feather name="chevron-right" size={20} color="#3E4A5A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Feather name="phone" size={20} color="#3E4A5A" />
          <Text style={styles.menuText}>Contacts</Text>
          <Feather name="chevron-right" size={20} color="#3E4A5A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Feather name="settings" size={20} color="#3E4A5A" />
          <Text style={styles.menuText}>Settings</Text>
          <Feather name="chevron-right" size={20} color="#3E4A5A" />
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: '#F5F5F5' }]}
          onPress={() => setShowConfirm(!showConfirm)}
        >
          <MaterialIcons name="logout" size={20} color="#3E4A5A" />
          <Text style={styles.menuText}>Sign out</Text>
          <Ionicons
            name={showConfirm ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#3E4A5A"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Sign Out */}
      {showConfirm && (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmText}>
            Are you sure you want to sign out your account?
          </Text>
          <TouchableOpacity style={styles.yesBtn}>
            <Text style={styles.yesText}>YES</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFC',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  nameText: {
    fontWeight: 'bold',
    color: '#FE712D',
    fontSize: 16,
  },
  phoneText: {
    color: '#3E4A5A',
    fontSize: 13,
  },
  verifyText: {
    color: '#999',
    fontSize: 12,
  },
  menuList: {
    marginTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: '#E9EDF2',
    borderRadius: 6,
    marginBottom: 30,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#3E4A5A',
  },
  confirmBox: {
    backgroundColor: '#E9EDF2',
    padding: 16,
    borderRadius: 6,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmText: {
    color: '#3E4A5A',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  yesBtn: {
    backgroundColor: '#FE712D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  yesText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});