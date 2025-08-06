import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAdmins } from '../../hooks/useUsers';
import { useCreateNotification } from '../../hooks/useNotifications';
import { useRequests } from '../../hooks/useRequests';
import { useStoredUser } from '../../hooks/useStoredUser';
import { router } from 'expo-router';

const categories = [
  { type: 'Crime', icon: 'shield-outline', color: '#EF4444' },
  { type: 'Price', icon: 'pricetag-outline', color: '#F59E0B' },
  { type: 'Women Abuse', icon: 'person-outline', color: '#EC4899' },
  { type: 'Accident', icon: 'car-outline', color: '#DC2626' },
  { type: 'Fire', icon: 'flame-outline', color: '#F97316' },
  { type: 'Child Abuse', icon: 'heart-outline', color: '#10B981' },
  { type: 'Red Tape', icon: 'document-text-outline', color: '#8B5CF6' },
  { type: 'Scam', icon: 'warning-outline', color: '#F59E0B' },
  { type: 'Emergency', icon: 'alert-circle-outline', color: '#EF4444' },
  { type: 'Others', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

const ComplaintScreen = () => {
  const user = useStoredUser();
  const [formData, setFormData] = useState({
    title: '',
    customCategory: '',
    description: '',
    incidentDate: new Date(),
    incidentLocation: '',
    agreed: false,
  });
  const [gpsLocation, setGpsLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { mutate: createRequest, isLoading } = useRequests().useCreateRequest();
  const { mutate: createNotification } = useCreateNotification();
  const { data: admins } = useAdmins();

  const formatDate = (date) => date.toISOString().split('T')[0];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('incidentDate', selectedDate);
    }
  };

  const handleTextDateChange = (text) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(text)) {
      const newDate = new Date(text);
      if (!isNaN(newDate.getTime())) {
        handleInputChange('incidentDate', newDate);
      }
    }
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location services');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      const addressString = addressResponse[0] 
        ? [
            addressResponse[0].street,
            addressResponse[0].city,
            addressResponse[0].region,
            addressResponse[0].postalCode,
            addressResponse[0].country
          ].filter(Boolean).join(', ')
        : `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setGpsLocation({ latitude, longitude, address: addressString });
      handleInputChange('incidentLocation', addressString);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSubmit = () => {
    const { title, customCategory, description, agreed, incidentLocation, incidentDate } = formData;

    if (!user?.id) {
      Alert.alert('Error', 'User information not loaded. Please try again.');
      return;
    }
    const finalTitle = title === 'Others' ? customCategory : title;
    
    if (!title || !description || !agreed || !incidentLocation || (title === 'Others' && !customCategory)) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const requestData = {
      title: finalTitle,
      description: description,
      type: 'complaints', 
      userId: user?.id,
      complaintsObj: {
        incidentDate: incidentDate.toISOString(),
        incidentLocation,
        isSolved: false,
      },
    };

    createRequest(requestData, {
      onSuccess: (data) => {
        admins?.forEach(admin => {
          createNotification({
            userId: admin.id,
            requestId: data?.id,
            requestType: 'complaints',
            title: 'New Complaint',
            description: 'A new complaint has been submitted',
          });
        });
        Alert.alert('Success', 'Complaint submitted');
        resetForm();
      },
      onError: (error) => {
        Alert.alert('Error', error.description || 'Submission failed');
      },
    });
  };

  const resetForm = () => {
    setFormData({
      userId: user?.id,
      title: '',
      customCategory: '',
      description: '',
      incidentDate: new Date(),
      incidentLocation: '',
      agreed: false,
    });
    setGpsLocation(null);
  };

  const CategoryDropdown = () => (
    <Modal
      visible={showCategoryModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.type}
                style={[
                  styles.modalItem,
                  formData.title === category.type && styles.modalItemSelected
                ]}
                onPress={() => {
                  handleInputChange('title', category.type);
                  if (category.type !== 'Others') {
                    handleInputChange('customCategory', '');
                  }
                  setShowCategoryModal(false);
                }}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon} size={18} color="#fff" />
                </View>
                <Text style={styles.modalItemText}>{category.type}</Text>
                {formData.title === category.type && (
                  <Ionicons name="checkmark" size={20} color="#FE712D" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const selectedCategory = categories.find(cat => cat.type === formData.title);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Report Issues</Text>
            <Text style={styles.subtitle}>Report any issues you encounter</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What is your concern? *</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <View style={styles.dropdownContent}>
              {selectedCategory && (
                <View style={[styles.categoryIcon, { backgroundColor: selectedCategory.color }]}>
                  <Ionicons name={selectedCategory.icon} size={16} color="#fff" />
                </View>
              )}
              <Text style={styles.dropdownText}>
                {formData.title || 'Select a category'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {formData.title === 'Others' && (
            <View style={styles.customCategoryContainer}>
              <Text style={styles.sectionLabel}>Specify Category *</Text>
              <TextInput
                style={styles.customInput}
                value={formData.customCategory}
                onChangeText={(text) => handleInputChange('customCategory', text)}
                placeholder="Describe the incident type"
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>When did this happen?</Text>
          <TouchableOpacity 
            style={styles.dateInputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <TextInput
              style={styles.dateInput}
              value={formatDate(formData.incidentDate)}
              onChangeText={handleTextDateChange}
              onPress={() => setShowDatePicker(true)}
              placeholder="YYYY-MM-DD"
              editable={false}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.incidentDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location *</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationInputContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <TextInput
                value={formData.incidentLocation}
                onChangeText={(text) => handleInputChange('incidentLocation', text)}
                placeholder="Where is this located?"
              />
            </View>
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={getCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="locate" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          {gpsLocation && (
            <View style={styles.gpsInfo}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.gpsInfoText}>
                {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description *</Text>
          <TextInput
            style={styles.textArea}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="Describe what happened in detail..."
            multiline
          />
          <Text style={styles.charCount}>{formData.description?.length}/500</Text>
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => handleInputChange('agreed', !formData.agreed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, formData.agreed && styles.checkedBox]}>
              {formData.agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.termsText}>
              By selecting this checkbox, I agree and accept the{' '}
              <Text style={styles.link}>Respondee Terms of Service</Text> and{' '}
              <Text style={styles.link}>Data Privacy Statement</Text>. <Text style={styles.required}>*</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!formData.title || !formData.description || !formData.agreed || !formData.incidentLocation || 
             (formData.title === 'Others' && !formData.customCategory)) && 
              styles.submitBtnDisabled
          ]}
          onPress={handleSubmit}
          disabled={isLoading || !formData.title || !formData.description || !formData.agreed || 
                   !formData.incidentLocation || (formData.title === 'Others' && !formData.customCategory)}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <CategoryDropdown />
    </View>
  );
};

export default ComplaintScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    flexDirection: 'column',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  required: {
    color: '#EF4444',
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownButtonSelected: {
    borderColor: '#FE712D',
    backgroundColor: '#FFF7ED',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  customCategoryContainer: {
    marginTop: 16,
  },
  customInput: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#374151',
    minHeight: 56,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  gpsButton: {
    backgroundColor: '#FE712D',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 56,
    shadowColor: '#FE712D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  gpsButtonLoading: {
    backgroundColor: '#FEB366',
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  gpsInfoText: {
    fontSize: 12,
    color: '#166534',
    flex: 1,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: '#FE712D',
    borderColor: '#FE712D',
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  link: {
    color: '#FE712D',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  submitBtn: {
    backgroundColor: '#FE712D',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    shadowColor: '#FE712D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitLoadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  modalItemSelected: {
    backgroundColor: '#FFF7ED',
  },
  modalItemText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
});