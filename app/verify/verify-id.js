import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ID_OPTIONS = [
  'Identification Card',
  'Driver\'s License',
  'Passport',
  'Philippine Identification (PhilID / ePhilID)',
  'Philippine Postal ID',
  'Voter\'s ID',
  'School ID',
];

export default function VerifyIdScreen() {
  const [selected, setSelected] = useState('Identification Card');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSelect = (item) => {
    setSelected(item);
    setDropdownOpen(false);
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Choose your verification document</Text>
        <Text style={styles.subText}>
          (Your address should be included to prove your residency in Barangay 176.)
        </Text>

        {/* Dropdown */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <Ionicons name="card-outline" size={20} color="#3E4A5A" />
          <Text style={styles.dropdownText}>{selected}</Text>
          <Ionicons name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#3E4A5A" />
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownList}>
            {ID_OPTIONS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Button at the very bottom */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/verify/verify-scan')}
      >
        <Text style={styles.buttonText}>Scan the document</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFC',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    color: '#5B6B7F',
    fontSize: 13,
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D0D7DF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  dropdownText: {
    flex: 1,
    textAlign: 'center',
    color: '#3E4A5A',
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D0D7DF',
    borderRadius: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    color: '#3E4A5A',
  },
  button: {
    backgroundColor: '#FE712D',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});