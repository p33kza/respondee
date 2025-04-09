import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const categories = [
  { type: 'Sum of Money', icon: 'cash' },
  { type: 'Theft', icon: 'lock-closed' },
  { type: 'Harassment', icon: 'warning' },
  { type: 'Defamation', icon: 'chatbubble-ellipses' },
  { type: 'Fraud', icon: 'alert-circle' },
  { type: 'Others', icon: 'ellipsis-horizontal' },
];

// const [isEmergency, setIsEmergency] = useState(false);

export default function ComplaintScreen() {
  const [selectedType, setSelectedType] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const toggleType = (type) => setSelectedType(type);

  const handleSubmit = () => {
    if (!selectedType || !message || !agreed) {
      Alert.alert('Incomplete', 'Please fill out all fields and accept the terms.');
      return;
    }
    Alert.alert('Please verify first before submitting a report');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Section Title */}
      <Text style={styles.title}>Details of report</Text>
      <Text style={styles.subtitle}>Select type of report</Text>

      {/* Grid of report types */}
      <View style={styles.grid}>
        {categories.map(({ type, icon }) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.categoryBox,
              selectedType === type && styles.activeCategory,
            ]}
            onPress={() => toggleType(type)}
          >
            <Ionicons name={icon} size={24} color="#444" />
            <Text style={styles.categoryText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback Input */}
      <Text style={styles.subtitle}>Feedback message</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Type feedback here"
        multiline
        numberOfLines={6}
        maxLength={500}
        value={message}
        onChangeText={setMessage}
      />
      <Text style={styles.charCount}>{message.length}/500</Text>

      {/* File Upload Placeholder */}
      <Text style={styles.subtitle}>Upload a softcopy evidence</Text>
      <TouchableOpacity style={styles.uploadBox}>
        <Ionicons name="cloud-upload-outline" size={30} color="#FE712D" />
        <Text style={styles.uploadText}>Upload File/s</Text>
        <Text style={styles.uploadSubText}>Photo, Video, .jpg / .png / .mp4 Max of 5 files.</Text>
      </TouchableOpacity>

      {/* 5. Emergency Toggle */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Mark as Emergency</Text>
        <Switch value={isEmergency} onValueChange={setIsEmergency} />
      </View>

      {/* Terms Agreement */}
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setAgreed(!agreed)}
      >
        <View style={[styles.checkbox, agreed && styles.checkedBox]}>
          {agreed && <Ionicons name="checkmark" size={12} color="#fff" />}
        </View>
        <Text style={styles.termsText}>
          By selecting this checkbox, I agree and accept the{' '}
          <Text style={styles.link}>Respondee Terms of Service</Text> and{' '}
          <Text style={styles.link}>Data Privacy Statement</Text>.
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Send the Report</Text>
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
  subtitle: {
    fontSize: 14,
    marginVertical: 10,
    fontWeight: '500',
    color: '#444',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryBox: {
    width: '47%',
    backgroundColor: '#F3F4F6',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeCategory: {
    borderWidth: 1,
    borderColor: '#FE712D',
    backgroundColor: '#FFECE2',
  },
  categoryText: {
    marginTop: 8,
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
  },
  uploadText: {
    fontWeight: 'bold',
    color: '#FE712D',
    marginTop: 8,
  },
  uploadSubText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#888',
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#999',
    marginTop: 3,
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
  submitBtn: {
    backgroundColor: '#FE712D',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
