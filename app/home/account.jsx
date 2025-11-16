import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useStoredUser } from '../../hooks/useStoredUser';
import { usePartialUpdateUser, useUser } from '../../hooks/useUsers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../apis/api';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    email: ''
  });
  const [isUploadingGov, setIsUploadingGov] = useState(false);

  const userResult = useStoredUser();
  const { data: user, refetch } = useUser(userResult?.id);

  const isVerified = Boolean(
    (user?.isEmailVerified && user?.isPhoneVerified) || user?.adminVerified
  );

  const { mutateAsync: updateUserMutation, isPending: isUpdating } = usePartialUpdateUser();

  React.useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  React.useEffect(() => {
    if (!userResult?.id || !refetch) return;
    const id = setInterval(() => refetch(), 5000);
    return () => clearInterval(id);
  }, [userResult?.id, refetch]);

  useFocusEffect(
    React.useCallback(() => {
      refetch?.();
      return () => {};
    }, [refetch])
  );

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
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text };
    }
    if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    return data?.url;
  };

  const handleChangeGovId = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access to change your ID.');
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
      if (!base64) throw new Error('Could not read selected image.');

      const url = await uploadVerificationImage(user.id, base64);

      await updateUserMutation({
        id: user.id,
        updates: { verificationImage: url, rejectReason: null },
      });

      await AsyncStorage.setItem(
        'user',
        JSON.stringify({ ...user, verificationImage: url, rejectReason: null })
      );

      await refetch?.();

      Alert.alert('Success', 'Your government ID has been updated.');
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to update ID. Please try again.');
    } finally {
      setIsUploadingGov(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('user');
              await AsyncStorage.removeItem('userId');
              await AsyncStorage.removeItem('email');
              await AsyncStorage.removeItem('otp');
              
              router.replace('/auth/login');
              if (router.canGoBack()) {
                router.dismissAll();
              }
            } catch (error) {
              console.error('Logout error:', error);
              router.replace('/auth/login');
            }
          }
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await updateUserMutation({
        id: user.id,
        updates: formData
      });
      setIsEditing(false);
      AsyncStorage.removeItem('user')
      AsyncStorage.setItem('user', JSON.stringify({
        ...user,
        ...formData
      }));
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Update profile error:', error);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      displayName: user?.displayName || '',
      phone: user?.phone || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const MenuModal = () => (
    <Modal
      visible={showMenu}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowMenu(false)}
    >
      <TouchableOpacity 
        style={styles.menuOverlay} 
        activeOpacity={1}
        onPress={() => setShowMenu(false)}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              setIsEditing(true);
            }}
          >
            <MaterialIcons name="edit" size={20}/>
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              setShowAbout(true);
            }}
          >
            <MaterialIcons name="info" size={20} />
            <Text style={styles.menuItemText}>About Respondee</Text>
          </TouchableOpacity>
          
          <View style={styles.menuSeparator} />
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => {
              setShowMenu(false);
              handleLogout();
            }}
          >
            <MaterialIcons name="logout" size={20} color="#FF3B30" />
            <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const AboutModal = () => (
    <Modal
      visible={showAbout}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAbout(false)}
    >
      <SafeAreaView style={styles.aboutContainer}>
        <View style={styles.aboutHeader}>
          <Text style={styles.aboutTitle}>About Respondee</Text>
          <TouchableOpacity onPress={() => setShowAbout(false)}>
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.aboutContent}>
          <View style={styles.aboutSection}>
            <MaterialIcons name="assignment" size={48} color="#FF9500" style={styles.aboutIcon} />
            <Text style={styles.aboutAppName}>Respondee</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          </View>
          
          <View style={styles.aboutTextSection}>
            <Text style={styles.aboutDescription}>
              Respondee is your comprehensive request management platform. 
              Submit, track, and manage all your requests in one convenient location.
            </Text>
            
            <Text style={styles.aboutSectionTitle}>Features</Text>
            <Text style={styles.aboutFeature}>• Submit various types of requests</Text>
            <Text style={styles.aboutFeature}>• Track request status in real-time</Text>
            <Text style={styles.aboutFeature}>• Receive notifications and updates</Text>
            
            <Text style={styles.aboutSectionTitle}>Support</Text>
            <Text style={styles.aboutText}>
              For assistance or feedback, please contact our support team through the app or visit our website.
            </Text>
            
            <Text style={styles.aboutCopyright}>
              © 2024 Respondee. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <MaterialIcons name="more-vert" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          {/* Wrapper so the badge can sit outside the clipped circle */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              style={styles.avatarContainer}
              activeOpacity={0.85}
              onPress={handleChangeGovId}
            >
              {user?.verificationImage ? (
                <Image
                  source={{ uri: user.verificationImage }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <MaterialIcons name="person" size={48} color="#FFFFFF" />
              )}

              {isUploadingGov && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Badge now outside the circle */}
            <View style={styles.avatarEditBadge}>
              <MaterialIcons name="edit" size={16} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.displayNameRow}>
            <Text style={[styles.displayName, { marginBottom: 0 }]}>
              {user.displayName || 'User'}
            </Text>
            <MaterialIcons
              name={isVerified ? 'verified' : 'cancel'}
              size={20}
              color={isVerified ? '#34C759' : '#FF3B30'}
              style={styles.verifiedIcon}
            />
          </View>

          <Text style={styles.userId}>ID: {user.id?.toString().slice(-8) || 'N/A'}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Display Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={formData.displayName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                placeholder="Enter display name"
                placeholderTextColor="#8E8E93"
              />
            ) : (
              <Text style={styles.infoValue}>{user.displayName || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <View style={styles.verificationContainer}>
                <Text style={[
                  styles.verificationText,
                  { color: user.isEmailVerified ? "#34C759" : "#FF9500" }
                ]}>
                  
                </Text>
              </View>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Enter email"
                placeholderTextColor="#8E8E93"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.infoValue}>{user.email || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoLabel}>Phone</Text>
              <View style={styles.verificationContainer}>

                <Text style={[
                  styles.verificationText,
                  { color: user.isPhoneVerified ? "#34C759" : "#FF9500" }
                ]}>
                  
                </Text>
              </View>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                placeholderTextColor="#8E8E93"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{user.phone || 'Not set'}</Text>
            )}
          </View>

          {/* Verification rejection notice */}
          {Boolean(user?.rejectReason) && (
            <View style={styles.rejectionBox}>
              <Text style={styles.rejectionTitle}>
                Your verification request has been rejected!
              </Text>
              <Text style={styles.rejectionReason}>
                {user.rejectReason}
              </Text>
            </View>
          )}
        </View>
    

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelEdit}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, isUpdating && styles.disabledButton]}
              onPress={handleSaveProfile}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <MenuModal />
      <AboutModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  menuButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ff9500',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
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
    backgroundColor: '#ff9500',
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
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  displayNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  userId: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'monospace',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  infoItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
  },
  editInput: {
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffffff',
  },
  statusContainer: {
    paddingHorizontal: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statusLabel: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#8E8E93',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#ff9500',
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutItem: {
    borderTopWidth: 0,
  },
  logoutText: {
    color: '#FF3B30',
  },
  menuSeparator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 4,
  },
  
  aboutContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  aboutContent: {
    flex: 1,
  },
  aboutSection: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  aboutIcon: {
    marginBottom: 16,
  },
  aboutAppName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  aboutVersion: {
    fontSize: 16,
    color: '#8E8E93',
  },
  aboutTextSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  aboutDescription: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  aboutSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    marginTop: 20,
  },
  aboutFeature: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
    marginBottom: 24,
  },
  aboutCopyright: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  rejectionBox: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 6,
  },
  rejectionReason: {
    fontSize: 13,
    color: '#000',
    lineHeight: 18,
  },
});