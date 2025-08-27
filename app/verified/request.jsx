import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function RequestScreen() {
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const requestOptions = [
    { icon: 'broom', label: 'Garbage Pickup' },
    { icon: 'lightbulb-outline', label: 'Streetlight Repair' },
    { icon: 'water-outline', label: 'Water Service Issue' },
    { icon: 'road-variant', label: 'Road Maintenance' },
    { icon: 'wheelchair-accessibility', label: 'Accessibility Concern' },
    { icon: 'tree-outline', label: 'Tree Trimming' },
    { icon: 'bus-outline', label: 'Public Transport' },
    { icon: 'alert-circle-outline', label: 'Emergency Assistance' },
  ];

  const handleSubmit = () => {
    if (!selectedType || !description || !agreed) {
      Alert.alert('Incomplete', 'Please fill out all fields and accept the terms.');
      return;
    }
    Alert.alert('✅ Submitted', 'Your request has been sent!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Details of Request</Text>

      {/* 1. Select Request Type */}
      <Text style={styles.sectionLabel}>Select Type of Request</Text>
      <View style={styles.grid}>
        {requestOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.gridItem,
              selectedType === item.label && styles.activeGridItem,
            ]}
            onPress={() => setSelectedType(item.label)}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={28}
              color={selectedType === item.label ? '#FE712D' : '#666'}
            />
            <Text style={styles.gridText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 2. Description */}
      <Text style={styles.sectionLabel}>Describe your request</Text>
      <TextInput
        style={styles.textArea}
        multiline
        maxLength={500}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter the details of your request..."
      />
      <Text style={styles.charCount}>{description.length}/500</Text>

      {/* 3. Upload Files */}
      <Text style={styles.sectionLabel}>Upload supporting files</Text>
      <TouchableOpacity style={styles.uploadBox}>
        <Ionicons name="cloud-upload-outline" size={30} color="#FE712D" />
        <Text style={styles.uploadText}>Upload .jpg / .png / .pdf / .mp4</Text>
        <Text style={styles.uploadSubText}>Max of 5 files</Text>
      </TouchableOpacity>

      {/* 4. Location Options */}
      <Text style={styles.sectionLabel}>Select Location</Text>
      <View style={styles.locationOptions}>
        <TouchableOpacity style={styles.locationBtn}>
          <Ionicons name="navigate-outline" size={18} color="#FE712D" />
          <Text style={styles.locationText}>Use GPS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationBtn}>
          <Ionicons name="map-outline" size={18} color="#FE712D" />
          <Text style={styles.locationText}>Select on Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationBtn}>
          <Ionicons name="location-outline" size={18} color="#FE712D" />
          <Text style={styles.locationText}>Enter Address</Text>
        </TouchableOpacity>
      </View>

      {/* 5. Emergency Toggle */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Mark as Emergency</Text>
        <Switch value={isEmergency} onValueChange={setIsEmergency} />
      </View>

      {/* 6. Terms Agreement */}
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setAgreed(!agreed)}
      >
        <View style={[styles.checkbox, agreed && styles.checkedBox]}>
          {agreed && <Ionicons name="checkmark" size={12} color="#fff" />}
        </View>
        <Text style={styles.termsText}>
          I agree to the <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 80,
        backgroundColor: '#fff',
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#1C1C1C',
      },
    sectionLabel: {
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#3E4A5A',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: -190,
    },
    gridItem: {
      width: '40%',
      aspectRatio: 1,
      backgroundColor: '#F4F4F4',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom:16,
    },
    activeGridItem: {
      backgroundColor: '#FFECE2',
      borderWidth: 1,
      borderColor: '#FE712D',
    },
    gridText: {
      fontSize: 10,
      textAlign: 'center',
      marginTop: 6,
      color: '#3E4A5A',
    },
    textArea: {
      height: 100,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      backgroundColor: '#fff',
      textAlignVertical: 'top',
      marginBottom: 6,
    },
    charCount: {
      fontSize: 10,
      color: '#999',
      textAlign: 'right',
      marginBottom: 20,
    },
    uploadBox: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      backgroundColor: '#F4F4F4',
      padding: 16,
      alignItems: 'center',
      marginBottom: 24,
    },
    uploadText: {
      fontWeight: 'bold',
      color: '#FE712D',
      marginTop: 8,
    },
    uploadSubText: {
      fontSize: 12,
      color: '#999',
      marginTop: 4,
      textAlign: 'center',
    },
    locationOptions: {
      gap: 10,
      marginBottom: 20,
    },
    locationBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      backgroundColor: '#F4F4F4',
      borderRadius: 6,
    },
    locationText: {
      fontSize: 12,
      color: '#3E4A5A',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    switchLabel: {
      color: '#3E4A5A',
      fontWeight: 'bold',
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#999',
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkedBox: {
      backgroundColor: '#FE712D',
      borderColor: '#FE712D',
    },
    termsText: {
      fontSize: 12,
      color: '#555',
      flex: 1,
    },
    link: {
      color: '#FE712D',
      fontWeight: 'bold',
      textDecorationLine: 'underline',
    },
    submitBtn: {
      backgroundColor: '#FE712D',
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 40,
    },
    submitText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
  