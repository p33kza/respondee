import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { useRequests } from '../../hooks/useRequests';
import { useStoredUser } from '../../hooks/useStoredUser';
import { router } from 'expo-router';
import { useAdmins } from '../../hooks/useUsers';
import { useInventoryItems } from '../../hooks/useInventory';

const requestCategories = [
  { type: 'Event Equipment', icon: 'mic-outline', color: '#FF8C42' },
  { type: 'Transportation', icon: 'car-outline', color: '#4A90E2' },
  { type: 'Audio/Visual Equipment', icon: 'camera-outline', color: '#9B59B6' },
  { type: 'Tables & Chairs', icon: 'grid-outline', color: '#27AE60' },
  { type: 'Tents & Canopies', icon: 'umbrella-outline', color: '#E74C3C' },
  { type: 'Catering Supplies', icon: 'restaurant-outline', color: '#F39C12' },
  { type: 'Cleaning Supplies', icon: 'brush-outline', color: '#16A085' },
  { type: 'Medical/First Aid', icon: 'medical-outline', color: '#E67E22' },
  { type: 'Sports Equipment', icon: 'football-outline', color: '#8E44AD' },
  { type: 'Office Supplies', icon: 'briefcase-outline', color: '#34495E' },
  { type: 'Construction Tools', icon: 'hammer-outline', color: '#D35400' },
  { type: 'Others', icon: 'ellipsis-horizontal', color: '#95A5A6' },
];

export default function LogisticsScreen() {
    const [selectedType, setSelectedType] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [description, setDescription] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isEmergency, setIsEmergency] = useState(false);
    const [requestLocation, setRequestLocation] = useState('');
    const [gpsLocation, setGpsLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [items, setItems] = useState([{ item: '', itemId: null, quantity: '' }]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    
    const [eventDate, setEventDate] = useState(new Date());
    const [returnDate, setReturnDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
    const [showEventDatePicker, setShowEventDatePicker] = useState(false);
    const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);

    const user = useStoredUser();
    const { useCreateRequest } = useRequests();
    const { data: admins } = useAdmins();
    const { data: inventory } = useInventoryItems(); 
    const { mutate: submitRequest, isLoading: isSubmitting } = useCreateRequest();

    const getCurrentLocation = useCallback(async () => {
      setLoadingLocation(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Please enable location permissions in settings.');
          return;
        }

        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude } = location.coords;

        let addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
        let addressString = addressResponse.length > 0 
          ? [
              addressResponse[0].street,
              addressResponse[0].city,
              addressResponse[0].region,
              addressResponse[0].postalCode,
              addressResponse[0].country
            ].filter(Boolean).join(', ')
          : `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;

        setGpsLocation({ latitude, longitude, address: addressString });
        setRequestLocation(
          addressString.includes('Lat:') 
            ? `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            : `${addressString} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
        );
      } catch (error) {
        Alert.alert('Error', 'Could not get your location. Please try again.');
      } finally {
        setLoadingLocation(false);
      }
    }, []);

    const handleQuantityChange = (index, value) => {
      const updatedItems = [...items];
      updatedItems[index].quantity = value;
      setItems(updatedItems);
    };

    const handleInventoryItemSelect = (inventoryItem) => {
      const updatedItems = [...items];
      updatedItems[selectedItemIndex] = {
        item: inventoryItem.name,
        itemId: inventoryItem.id,
        quantity: updatedItems[selectedItemIndex].quantity || ''
      };
      setItems(updatedItems);
      setShowInventoryModal(false);
      setSelectedItemIndex(null);
    };

    const openInventoryModal = (index) => {
      setSelectedItemIndex(index);
      setShowInventoryModal(true);
    };

    const addMoreItems = () => {
      const newIndex = items.length;
      setItems([...items, { item: '', itemId: null, quantity: '' }]);
      setSelectedItemIndex(newIndex);
      setShowInventoryModal(true);
    };

    const removeItem = (index) => {
      if (items.length > 1) {
        const updatedItems = [...items];
        updatedItems.splice(index, 1);
        setItems(updatedItems);
      }
    };

    const handleCategorySelect = useCallback((type) => {
      setSelectedType(type);
      setShowCategoryModal(false);
      if (type !== 'Others') setCustomCategory('');
    }, []);

    const onEventDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || eventDate;
      setShowEventDatePicker(Platform.OS === 'ios');
      setEventDate(currentDate);
      
      if (currentDate >= returnDate) {
        setReturnDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
      }
    };

    const onReturnDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || returnDate;
      setShowReturnDatePicker(Platform.OS === 'ios');
      
      if (currentDate >= eventDate) {
        setReturnDate(currentDate);
      } else {
        Alert.alert('Invalid Date', 'Return date cannot be before event date.');
      }
    };

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const handleSubmit = useCallback(() => {
      if (!selectedType || !description || !agreed || !requestLocation) {
        Alert.alert('Error', 'Please fill in all required fields.');
        return;
      }

      const validItems = items.filter(item => item.item && item.quantity && item.itemId);
      if (validItems.length === 0) {
        Alert.alert('Error', 'Please add at least one item with quantity.');
        return;
      }

      const finalTitle = selectedType === 'Others' ? customCategory : selectedType;
      
      const requestData = {
        type: 'logistics',
        title: finalTitle,
        description,
        status: 'pending',
        priority: isEmergency ? 'high' : 'medium',
        userId: user?.id,
        logisticsObj: {
          items: validItems,
          eventDate: eventDate.toISOString(),
          returnDate: returnDate.toISOString(),
          location: requestLocation,
          isSynced: false,
          isReturned: false,
        },
        date: new Date().toISOString(),
        isStarred: false,
        isSpam: false,
        isRead: false,
        isNew: true,
        labelAs: 'none'
      };

      submitRequest(requestData, {
        onSuccess: () => {
          admins?.forEach(admin => {
            createNotification({
              userId: admin.id,
              title: 'New Logistics Submitted.',
              description: 'A new logistics request has been submitted',
            });
          });
          Alert.alert('Success', 'Logistics request submitted successfully!', [
            { text: 'OK', onPress: () => {
              setSelectedType('');
              setCustomCategory('');
              setDescription('');
              setAgreed(false);
              setIsEmergency(false);
              setRequestLocation('');
              setItems([{ item: '', itemId: null, quantity: '' }]);
              setEventDate(new Date());
              setReturnDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
            }}
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', 'Failed to submit request. Please try again.');
          console.error('Submit error:', error);
        }
      });
    }, [selectedType, customCategory, description, agreed, requestLocation, isEmergency, items, eventDate, returnDate, user?.id, submitRequest]);

    const selectedCategory = requestCategories.find(cat => cat.type === selectedType);

    return (
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#334155" />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Text style={styles.title}>Logistics Request</Text>
              <Text style={styles.subtitle}>Request equipment and supplies for your events</Text>
            </View>
          </View>

          {/* Request Type Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Type of Request <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.dropdownButton, selectedType && styles.dropdownButtonSelected]}
              onPress={() => setShowCategoryModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dropdownContent}>
                {selectedCategory && (
                  <View style={[styles.categoryIcon, { backgroundColor: selectedCategory.color }]}>
                    <Ionicons name={selectedCategory.icon} size={16} color="#fff" />
                  </View>
                )}
                <Text style={[styles.dropdownText, !selectedType && styles.placeholder]}>
                  {selectedType || 'Choose request type'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {selectedType === 'Others' && (
              <View style={styles.customCategoryContainer}>
                <Text style={styles.sectionLabel}>
                  Specify Type <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.customInput}
                  placeholder="Enter custom request type"
                  value={customCategory}
                  onChangeText={setCustomCategory}
                  maxLength={50}
                  placeholderTextColor="#999"
                />
              </View>
            )}
          </View>

          {/* Items Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Items Needed <Text style={styles.required}>*</Text></Text>
            <View style={styles.itemsContainer}>
              {items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <TouchableOpacity 
                      style={[styles.itemInput, styles.itemNameInput, styles.itemSelector]}
                      onPress={() => openInventoryModal(index)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.itemSelectorText, !item.item && styles.itemSelectorPlaceholder]}>
                        {item.item || 'Select Item'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.itemInput, styles.itemQuantityInput]}
                      placeholder="Qty"
                      value={item.quantity}
                      onChangeText={(text) => handleQuantityChange(index, text)}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                    {items.length > 1 && (
                      <TouchableOpacity 
                        style={styles.removeItemButton}
                        onPress={() => removeItem(index)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.addMoreButton}
                onPress={addMoreItems}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FF8C42" />
                <Text style={styles.addMoreText}>Add More Items</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Event Schedule <Text style={styles.required}>*</Text></Text>
            
            <View style={styles.dateRow}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Event Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEventDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={18} color="#FF8C42" />
                  <Text style={styles.dateText}>{formatDate(eventDate)}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Return Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowReturnDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={18} color="#FF8C42" />
                  <Text style={styles.dateText}>{formatDate(returnDate)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              maxLength={500}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your logistics needs, event details, special requirements..."
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Event Location <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.locationContainer}>
              <View style={styles.locationInputContainer}>
                <Ionicons name="location-outline" size={16} color="#666" style={styles.locationIcon} />
                <TextInput 
                  placeholder='Event venue, address'
                  value={requestLocation}
                  onChangeText={setRequestLocation}
                  editable={!loadingLocation}
                  style={styles.locationInput}
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity
                style={[styles.gpsButton, loadingLocation && styles.gpsButtonLoading]}
                onPress={getCurrentLocation}
                disabled={loadingLocation}
                activeOpacity={0.7}
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
                  GPS: {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </View>

          {/* Priority Toggle */}
          <View style={styles.section}>
            <View style={styles.emergencyContainer}>
              <View style={styles.emergencyInfo}>
                <Ionicons 
                  name={isEmergency ? "flash" : "flash-outline"} 
                  size={20} 
                  color={isEmergency ? "#FF8C42" : "#999"} 
                />
                <View style={styles.emergencyTextContainer}>
                  <Text style={styles.emergencyLabel}>High Priority</Text>
                  <Text style={styles.emergencySubtext}>Mark as urgent for faster processing</Text>
                </View>
              </View>
              <Switch 
                value={isEmergency} 
                onValueChange={setIsEmergency}
                trackColor={{ false: '#E5E7EB', true: '#FFEDD5' }}
                thumbColor={isEmergency ? '#FF8C42' : '#fff'}
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          </View>

          {/* Terms Agreement */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreed && styles.checkedBox]}>
                {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
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
            style={[styles.submitBtn, (!agreed || !selectedType || !description || !requestLocation || isSubmitting) && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={!agreed || !selectedType || !description || !requestLocation || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.submitText}>Submit Request</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" style={styles.submitIcon} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Date Pickers */}
        {showEventDatePicker && (
          <DateTimePicker
            testID="eventDatePicker"
            value={eventDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onEventDateChange}
            minimumDate={new Date()}
          />
        )}
        
        {showReturnDatePicker && (
          <DateTimePicker
            testID="returnDatePicker"
            value={returnDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onReturnDateChange}
            minimumDate={eventDate}
          />
        )}

        {/* Category Selection Modal */}
        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Request Type</Text>
                <TouchableOpacity 
                  onPress={() => setShowCategoryModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList}>
                {requestCategories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalItem,
                      selectedType === category.type && styles.modalItemSelected
                    ]}
                    onPress={() => handleCategorySelect(category.type)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon} size={18} color="#fff" />
                    </View>
                    <Text style={styles.modalItemText}>{category.type}</Text>
                    {selectedType === category.type && (
                      <Ionicons name="checkmark" size={20} color="#FF8C42" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Inventory Selection Modal */}
        <Modal
          visible={showInventoryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowInventoryModal(false);
            setSelectedItemIndex(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Inventory Item</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowInventoryModal(false);
                    setSelectedItemIndex(null);
                  }}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList}>
                {inventory?.map((inventoryItem) => (
                  <TouchableOpacity
                    key={inventoryItem.id}
                    style={styles.inventoryItem}
                    onPress={() => handleInventoryItemSelect(inventoryItem)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.inventoryItemContent}>
                      <Text style={styles.inventoryItemName}>{inventoryItem.item}</Text>
                      {inventoryItem.description && (
                        <Text style={styles.inventoryItemDescription}>{inventoryItem.description}</Text>
                      )}
                      <View style={styles.inventoryItemMeta}>
                        <Text style={[styles.inventoryItemStock, 
                          inventoryItem.quantity > 0 ? styles.inStock : styles.outOfStock
                        ]}>
                          Stock: {inventoryItem.quantity || 0}
                        </Text>
                        {inventoryItem.category && (
                          <Text style={styles.inventoryItemCategory}>{inventoryItem.category}</Text>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
                {(!inventory || inventory.length === 0) && (
                  <View style={styles.emptyInventory}>
                    <Ionicons name="cube-outline" size={48} color="#999" />
                    <Text style={styles.emptyInventoryText}>No inventory items available</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffffff',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 80,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },
    headerTitle: {
      flexDirection: 'column',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#334155',
    },
    subtitle: {
      fontSize: 14,
      color: '#64748B',
      lineHeight: 20,
    },
    section: {
      backgroundColor: '#fff',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    link: {
      color: '#FF8C42',
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#334155',
      marginBottom: 8,
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
      padding: 14,
      backgroundColor: '#fff',
      minHeight: 52,
    },
    dropdownButtonSelected: {
      borderColor: '#FF8C42',
      backgroundColor: '#FFF7ED',
    },
    dropdownContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    dropdownText: {
      fontSize: 16,
      color: '#334155',
      flex: 1,
    },
    placeholder: {
      color: '#9CA3AF',
    },
    customCategoryContainer: {
      marginTop: 12,
    },
    customInput: {
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
      borderRadius: 12,
      padding: 14,
      backgroundColor: '#fff',
      fontSize: 16,
      color: '#334155',
      minHeight: 52,
    },
    itemsContainer: {
      gap: 8,
    },
    itemCard: {
      backgroundColor: '#F8FAFC',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    itemInput: {
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: 8,
      padding: 10,
      backgroundColor: '#fff',
      fontSize: 14,
      color: '#334155',
    },
    itemNameInput: {
      flex: 2,
    },
    itemSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemSelectorText: {
      fontSize: 14,
      color: '#334155',
      flex: 1,
    },
    itemSelectorPlaceholder: {
      color: '#9CA3AF',
    },
    itemQuantityInput: {
      flex: 1,
      textAlign: 'center',
    },
    removeItemButton: {
      padding: 4,
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
    addMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderWidth: 1.5,
      borderColor: '#FF8C42',
      borderRadius: 12,
      backgroundColor: '#FFF7ED',
      gap: 6,
    },
    addMoreText: {
      color: '#FF8C42',
      fontWeight: '600',
      fontSize: 14,
    },
    dateRow: {
      flexDirection: 'row',
      gap: 12,
    },
    dateContainer: {
      flex: 1,
    },
    dateLabel: {
      fontSize: 14,
      color: '#64748B',
      marginBottom: 6,
      fontWeight: '500',
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
      borderRadius: 12,
      padding: 12,
      backgroundColor: '#fff',
      gap: 8,
    },
    dateText: {
      fontSize: 14,
      color: '#334155',
      flex: 1,
    },
    textArea: {
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
      borderRadius: 12,
      padding: 14,
      minHeight: 100,
      backgroundColor: '#fff',
      fontSize: 16,
      color: '#334155',
      lineHeight: 22,
    },
    charCount: {
      fontSize: 12,
      color: '#9CA3AF',
      textAlign: 'right',
      marginTop: 6,
    },
    locationContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    locationInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
      borderRadius: 12,
      backgroundColor: '#fff',
      paddingHorizontal: 14,
      minHeight: 52,
    },
    locationIcon: {
      marginRight: 8,
    },
    locationInput: {
      flex: 1,
      fontSize: 16,
      color: '#334155',
    },
    gpsButton: {
      backgroundColor: '#FF8C42',
      borderRadius: 12,
      padding: 14,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 52,
    },
    gpsButtonLoading: {
      backgroundColor: '#FEB366',
    },
    gpsInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F0FDF4',
      padding: 10,
      borderRadius: 8,
      marginTop: 8,
      gap: 6,
    },
    gpsInfoText: {
      fontSize: 12,
      color: '#166534',
      flex: 1,
    },
    emergencyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#F8FAFC',
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    emergencyInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 10,
    },
    emergencyTextContainer: {
      flex: 1,
    },
    emergencyLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#334155',
      marginBottom: 2,
    },
    emergencySubtext: {
      fontSize: 12,
      color: '#6B7280',
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
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
      backgroundColor: '#FF8C42',
      borderColor: '#FF8C42',
    },
    termsText: {
      fontSize: 14,
      color: '#6B7280',
      flex: 1,
      lineHeight: 20,
    },
    submitBtn: {
      backgroundColor: '#FF8C42',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      shadowColor: '#FF8C42',
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
      maxHeight: '70%',
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
      color: '#334155',
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
      color: '#334155',
      flex: 1,
    },
    // Inventory Modal Styles
    inventoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    inventoryItemContent: {
      flex: 1,
    },
    inventoryItemName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#334155',
      marginBottom: 4,
    },
    inventoryItemDescription: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 6,
    },
    inventoryItemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    inventoryItemStock: {
      fontSize: 12,
      fontWeight: '500',
    },
    inStock: {
      color: '#059669',
    },
    outOfStock: {
      color: '#DC2626',
    },
    inventoryItemCategory: {
      fontSize: 12,
      color: '#9CA3AF',
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    emptyInventory: {
      alignItems: 'center',
      padding: 40,
      gap: 12,
    },
    emptyInventoryText: {
      fontSize: 16,
      color: '#9CA3AF',
      textAlign: 'center',
    },
  }
)