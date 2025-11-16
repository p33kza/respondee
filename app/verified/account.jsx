import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStoredUser } from '../../hooks/useStoredUser';
import { useUser, usePartialUpdateUser } from '../../hooks/useUsers';
import { useCreateNotification } from '../../hooks/useNotifications'; // if exists
import { API_BASE_URL } from '../../apis/api';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function AccountScreen() {
  const storedUser = useStoredUser();
  const { data: user, refetch } = useUser(storedUser?.id);
  const { mutateAsync: updateUserMutation, isPending: isUpdating } = usePartialUpdateUser();
  const createNotification = useCreateNotification?.();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUploadingGov, setIsUploadingGov] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);
  const rejectionNotifiedRef = useRef(false);

  const isVerified = Boolean(
    user?.adminVerified ||
    ((user?.isEmailVerified && user?.isPhoneVerified) && !user?.rejectReason)
  );

  // Resolve avatar (verificationImage or govId)
  useEffect(() => {
    let mounted = true;
    const raw = user?.verificationImage ?? user?.govId;
    const resolve = async () => {
      if (!raw) {
        if (mounted) setAvatarUri(null);
        return;
      }
      if (/^https?:\/\//i.test(raw)) {
        if (mounted) setAvatarUri(raw);
        return;
      }
      try {
        const url = await getDownloadURL(storageRef(getStorage(), raw));
        if (mounted) setAvatarUri(url);
      } catch (e) {
        console.warn('Verified avatar resolve failed:', e?.message || e);
        if (mounted) setAvatarUri(null);
      }
    };
    resolve();
    return () => { mounted = false; };
  }, [user?.verificationImage, user?.govId, user?.updatedAt]);

  // Poll user doc (5s)
  useEffect(() => {
    if (!storedUser?.id || !refetch) return;
    const id = setInterval(() => refetch(), 5000);
    return () => clearInterval(id);
  }, [storedUser?.id, refetch]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      refetch?.();
      return () => {};
    }, [refetch])
  );

  // Notify if rejectReason appears (unlikely in verified state, but included)
  useEffect(() => {
    const reason = user?.rejectReason;
    if (reason && !rejectionNotifiedRef.current) {
      rejectionNotifiedRef.current = true;
      Alert.alert('Verification Rejected', `Reason: ${reason}`, [{ text: 'OK' }]);
      const payload = {
        userId: user.id,
        title: 'Verification Rejected',
        description: reason,
        requestType: 'verification',
        isRead: false
      };
      if (createNotification?.mutateAsync) {
        createNotification.mutateAsync(payload).catch(e => console.warn('Notify error:', e));
      } else {
        fetch(`${API_BASE_URL}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        }).catch(e => console.warn('Fallback notify error:', e));
      }
    }
    if (!reason) {
      rejectionNotifiedRef.current = false;
    }
  }, [user?.rejectReason, user?.id]);

  const uploadVerificationImage = async (uid, base64) => {
    const url = `${API_BASE_URL}/api/users/${uid}/verification-image`;
    const body = {
      imageBase64: String(base64).replace(/^data:image\/\w+;base64,/, ''),
      contentType: 'image/jpeg',
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
    if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    return data?.url;
  };

  const handleChangeGovId = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission required', 'Allow photo library access to change your ID.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (result.canceled) return;
      setIsUploadingGov(true);
      const asset = result.assets?.[0];
      const base64 = asset?.base64;
      if (!base64) throw new Error('Could not read image.');
      const url = await uploadVerificationImage(user.id, base64);

      await updateUserMutation({
        id: user.id,
        updates: { verificationImage: url, rejectReason: null },
      });

      await AsyncStorage.setItem(
        'user',
        JSON.stringify({ ...user, verificationImage: url, rejectReason: null })
      );

      rejectionNotifiedRef.current = false;
      await refetch?.();
      Alert.alert('Success', 'Government ID updated.');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to update ID.');
    } finally {
      setIsUploadingGov(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FE712D" />
          <Text style={styles.loadingText}>Loading account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              style={styles.avatarContainer}
              activeOpacity={0.85}
              onPress={handleChangeGovId}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Ionicons name="person-circle-outline" size={64} color="#FFFFFF" />
              )}
              {isUploadingGov && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.avatarEditBadge}>
              <MaterialIcons name="edit" size={16} color="#FFFFFF" />
            </View>
          </View>

            <View style={{ marginLeft: 16, flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>{user.displayName || 'User'}</Text>
                <MaterialIcons
                  name={isVerified ? 'verified' : 'cancel'}
                  size={20}
                  color={isVerified ? '#34C759' : '#FF3B30'}
                  style={styles.verifiedIcon}
                />
              </View>
              <Text style={styles.phoneText}>{user.phone || 'No phone'}</Text>
              <Text style={styles.uidText}>ID: {user.id?.toString().slice(-8) || 'N/A'}</Text>
            </View>
        </View>

        {/* Rejection banner if present */}
        {Boolean(user.rejectReason) && (
          <View style={styles.rejectionBox}>
            <Text style={styles.rejectionTitle}>Your verification request has been rejected!</Text>
            <Text style={styles.rejectionReason}>{user.rejectReason}</Text>
          </View>
        )}

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBFC', padding: 24 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#3E4A5A' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FE712D',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FE712D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  nameText: { fontWeight: 'bold', color: '#FE712D', fontSize: 18, marginRight: 6 },
  verifiedIcon: { marginLeft: 2 },
  phoneText: { color: '#3E4A5A', fontSize: 13, marginTop: 2 },
  uidText: { color: '#64748B', fontSize: 11, marginTop: 2 },
  menuList: { marginTop: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: '#E9EDF2',
    borderRadius: 6,
    marginBottom: 24,
  },
  menuText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#3E4A5A' },
  confirmBox: {
    backgroundColor: '#E9EDF2',
    padding: 16,
    borderRadius: 6,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmText: { color: '#3E4A5A', fontSize: 14, flex: 1, marginRight: 10 },
  yesBtn: { backgroundColor: '#FE712D', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  yesText: { color: '#fff', fontWeight: 'bold' },
  rejectionBox: {
    marginTop: 4,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  rejectionTitle: { fontSize: 14, fontWeight: '700', color: '#FF3B30', marginBottom: 6 },
  rejectionReason: { fontSize: 13, color: '#000', lineHeight: 18 },
});