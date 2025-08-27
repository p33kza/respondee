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
import { useCreateNotification } from '../../hooks/useNotifications';
import * as DocumentPicker from 'expo-document-picker';

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
  const [proofFiles, setProofFiles] = useState([]);

  // --- Helpers for files ---
  const pickProofFiles = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        multiple: true,                 // multiple selection where supported
        copyToCacheDirectory: true,     // ensures a readable file:// uri
      });

      if (result.canceled) return;

      // result.assets (new API) or single result (older web shape)
      const picked = Array.isArray(result.assets) ? result.assets : [result];
      setProofFiles((prev) => [...prev, ...picked]);
    } catch (err) {
      console.error('DocumentPicker error:', err);
      Alert.alert('Error', 'Could not pick files.');
    }
  }, []);

  const removeProofFile = useCallback((index) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const [selectedType, setSelectedType] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [requestLocation, setRequestLocation] = useState('');
  const [gpsLocation, setGpsLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [items, setItems] = useState([{ item: '', quantity: '' }]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [eventType, setEventType] = useState('');
  const [customEvent, setCustomEvent] = useState('');
  const [deceasedName, setDeceasedName] = useState(''); // For Wake/Lamay events
  const [eventDate, setEventDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  // Example Event Types
  const eventTypes = [
    { type: 'Wake', color: '#FF6B6B', icon: 'heart' },
    // { type: 'Lamay', color: '#FF4757', icon: 'skull' },
    { type: 'Birthday', color: '#FFA502', icon: 'gift-outline' },
    { type: 'Cleaning', color: '#1E90FF', icon: 'trash-outline' },
    { type: 'Others', color: '#A55EEA', icon: 'ellipsis-horizontal' },
  ];

  // Handler to select Event Type
  const handleEventSelect = (type) => {
    setEventType(type);

    // Reset custom input if not Others
    if (type !== 'Others') setCustomEvent('');
    
    // Reset deceased name if not Wake/Lamay
    if (type !== 'Wake' && type !== 'Lamay') setDeceasedName('');

    setShowEventModal(false); // close modal after selection
  }

  const user = useStoredUser();
  const { useCreateRequest } = useRequests();
  const { data: admins } = useAdmins();
  const { data: inventory } = useInventoryItems();
  const { mutate: submitRequest, isLoading: isSubmitting } = useCreateRequest();
  const { mutate: createNotification } = useCreateNotification();

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
      item: inventoryItem.item || '',
      quantity: updatedItems[selectedItemIndex].quantity || '1'
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
    setItems([...items, { item: '', quantity: '' }]);
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

  // Update handler for multi-select
  const handleCategorySelect = useCallback((type) => {
    setSelectedTypes((prevSelected) => {
      if (prevSelected.includes(type)) {
        // Deselect if already selected
        return prevSelected.filter((t) => t !== type);
      } else {
        // Add to selected array
        return [...prevSelected, type];
      }
    });

    // Clear custom category if 'Others' is not selected
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

  const fileToBase64String = async (file) => {
    if (file.uri) {
      // React Native / Expo
      const FileSystem = await import('expo-file-system');
      return await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } else if (typeof File !== 'undefined' && file instanceof File) {
      // Web (older shape)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } else {
      throw new Error('Unknown file object');
    }
  };

  const handleSubmit = useCallback(async () => {
    console.log('Submitting, proofFiles:', proofFiles);

    // Validation
    if (!selectedTypes?.length || !description || !agreed || !requestLocation) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const validItems = items.filter(item => item.item?.trim() && item.quantity?.trim());
    if (validItems.length === 0) {
      Alert.alert('Error', 'Please add at least one valid item with quantity.');
      return;
    }

    // Build title string
    let finalTitle = '';
    if (selectedTypes.length === 1) {
      finalTitle = selectedTypes[0];
    } else if (selectedTypes.length === 2) {
      finalTitle = `${selectedTypes[0]} and ${selectedTypes[1]}`;
    } else {
      const allButLast = selectedTypes.slice(0, -1).join(', ');
      const last = selectedTypes[selectedTypes.length - 1];
      finalTitle = `${allButLast}, and ${last}`;
    }

    // Convert files to Base64 strings
    let base64Files = [];
    try {
      base64Files = await Promise.all(proofFiles.map(file => fileToBase64String(file)));
    } catch (err) {
      console.error('Error converting files:', err);
      Alert.alert('Error', 'Failed to process selected files.');
      return;
    }

    console.log('Base64 files prepared:', base64Files);

    const payload = {
      type: 'logistics',
      title: finalTitle,
      description,
      status: 'pending',
      priority: isEmergency ? 'high' : 'medium',
      userId: user?.id,
      date: new Date().toISOString(),
      logisticsObj: {
        items: validItems.map(item => ({ item: item.item, quantity: item.quantity })),
        eventDate: eventDate.toISOString(),
        returnDate: returnDate.toISOString(),
        location: requestLocation,
        isReturned: false,
      },
      proofFiles: base64Files, // ✅ Now guaranteed to be serializable
    };

    console.log('Payload to submit:', payload); // DEBUG: Verify Base64 included

    // Submit request
    submitRequest(payload, {
      onSuccess: (data) => {
        console.log('Request submitted successfully:', data);
        admins?.forEach(admin => {
          createNotification({
            userId: admin.id,
            requestId: data?.id,
            requestType: 'logistics',
            title: 'New Logistics Request',
            description: `A new logistics request for ${finalTitle} has been submitted`,
          });
        });

        Alert.alert('Success', 'Logistics request submitted successfully!', [
          { text: 'OK', onPress: () => {
            setSelectedTypes([]);
            setDescription('');
            setAgreed(false);
            setIsEmergency(false);
            setRequestLocation('');
            setItems([{ item: '', quantity: '' }]);
            setEventDate(new Date());
            setReturnDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
            setProofFiles([]);
          }}
        ]);
      },
      onError: (error) => {
        console.error('Submit error:', error);
        Alert.alert('Error', 'Failed to submit request. Please try again.');
      }
    });
  }, [
    selectedTypes,
    description,
    agreed,
    requestLocation,
    isEmergency,
    items,
    eventDate,
    returnDate,
    user?.id,
    submitRequest,
    proofFiles,
    admins,
    createNotification
  ]);

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

          {/* Dropdown Button */}
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              selectedTypes.length > 0 && styles.dropdownButtonSelected,
            ]}
            onPress={() => setShowCategoryModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dropdownContent}>
              {selectedTypes.length > 0 ? (
                <Text style={styles.dropdownText}>
                  {selectedTypes.join(", ")}
                </Text>
              ) : (
                <Text style={[styles.dropdownText, styles.placeholder]}>
                  Choose request type
                </Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Custom type input when 'Others' is chosen */}
          {selectedType === "Others" && (
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
        
        {/* Event Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Event Type <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dropdownButton, eventType && styles.dropdownButtonSelected]}
            onPress={() => setShowEventModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownText, !eventType && styles.placeholder]}>
              {eventType || 'Choose event type'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Show custom input if "Others" is selected */}
          {eventType === 'Others' && (
            <View style={styles.customCategoryContainer}>
              <Text style={styles.sectionLabel}>
                Specify Event <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.customInput}
                placeholder="Enter custom event type"
                value={customEvent}
                onChangeText={setCustomEvent}
                maxLength={50}
                placeholderTextColor="#999"
              />
            </View>
          )}

          {(eventType === 'Wake' || eventType === 'Lamay') && (
            <View style={styles.customCategoryContainer}>
              <Text style={styles.sectionLabel}>
                Name of Deceased <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.customInput}
                placeholder="Enter name"
                value={deceasedName}
                onChangeText={setDeceasedName}
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
              {items.map((item, index) => {
                // Find inventory item for stock
                const inventoryItem = inventory?.find(inv => inv.item === item.item);
                // Calculate remaining stock after current selections
                const usedQty = items.reduce((sum, it, idx) => {
                  if (it.item === item.item && idx !== index) {
                    return sum + (parseInt(it.quantity) || 0);
                  }
                  return sum;
                }, 0);
                const availableQty = inventoryItem ? Math.max((inventoryItem.quantity || 0) - usedQty, 0) : undefined;

                return (
                  <View key={`item-${index}`} style={styles.itemCard}>
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
                        onChangeText={(text) => {
                          // Limit input to availableQty
                          let val = text.replace(/[^0-9]/g, '');
                          if (availableQty !== undefined && val) {
                            val = Math.min(parseInt(val), availableQty).toString();
                          }
                          handleQuantityChange(index, val);
                        }}
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                        editable={!!item.item}
                        maxLength={4}
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
                    {item.item && inventoryItem && (
                      <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                        Available: {availableQty}
                      </Text>
                    )}
                  </View>
                );
              })}
              
              <TouchableOpacity 
                style={styles.addMoreButton}
                onPress={addMoreItems}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FF8C42" />
                <Text style={styles.addMoreText}>Add More Items</Text>
              </TouchableOpacity>
            </View>
            {/* Show total sum of quantities */}
            <Text style={{ fontSize: 14, color: '#334155', marginTop: 8 }}>
              Total Quantity: {items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}
            </Text>
          </View>

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
                  {inventory?.map((inventoryItem, index) => (
                    <TouchableOpacity
                      key={inventoryItem.id ? `inventory-${inventoryItem.id}` : `inventory-${index}-${inventoryItem.item || 'unknown'}`}
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

          {/* Proof Images & Documents */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Proof Images & Documents</Text>

            <TouchableOpacity
              style={styles.uploadButton}
              activeOpacity={0.7}
              onPress={pickProofFiles}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#FF8C42" />
              <Text style={styles.uploadButtonText}>
                {proofFiles.length > 0
                  ? `${proofFiles.length} file(s) selected`
                  : 'Upload files'}
              </Text>
            </TouchableOpacity>

            {proofFiles.length > 0 && (
              <View style={styles.fileList}>
                {proofFiles.map((file, index) => {
                  const name = file.name || file.fileName || 'Unnamed file';
                  const size = file.size;
                  const mime = file.mimeType || file.type;
                  const isImage =
                    (mime && String(mime).startsWith('image/')) ||
                    /\.(png|jpe?g|gif|webp)$/i.test(name);
                  const isPdf =
                    (mime && String(mime).toLowerCase() === 'application/pdf') ||
                    /\.pdf$/i.test(name);
                  const icon = isImage ? 'image-outline' : isPdf ? 'document-text-outline' : 'document-attach-outline';

                  return (
                    <View key={`${name}-${index}`} style={styles.fileItem}>
                      <View style={styles.fileLeft}>
                        <Ionicons name={icon} size={18} color="#64748B" />
                        <View style={{ flex: 1 }}>
                          <Text numberOfLines={1} style={styles.fileName}>{name}</Text>
                          {!!size && <Text style={styles.fileMeta}>{formatBytes(size)}</Text>}
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => removeProofFile(index)} style={styles.fileRemove} activeOpacity={0.7}>
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
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
            style={[
              styles.submitBtn, 
              (
              !agreed || 
              !selectedTypes?.length || 
              !description || 
              !requestLocation || 
              isSubmitting ||
              !eventType ||
              (eventType === 'Others' && !customEvent) ||
              ((eventType === 'Wake' || eventType === 'Lamay') && !deceasedName)
              ) && styles.submitBtnDisabled
            ]} 
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={
              !agreed || 
              !selectedTypes?.length || 
              !description || 
              !requestLocation || 
              isSubmitting ||
              !eventType ||
              (eventType === 'Others' && !customEvent) ||
              ((eventType === 'Wake' || eventType === 'Lamay') && !deceasedName)
            }
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

      {/* Event Type Modal */}
      <Modal
        visible={showEventModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Event Type</Text>
              <TouchableOpacity 
                onPress={() => setShowEventModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {eventTypes.map((event, index) => (
                <TouchableOpacity
                  key={`event-${index}-${event.type}`}
                  style={[
                    styles.modalItem,
                    eventType === event.type && styles.modalItemSelected
                  ]}
                  onPress={() => handleEventSelect(event.type)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: event.color }]}>
                    <Ionicons name={event.icon} size={18} color="#fff" />
                  </View>
                  <Text style={styles.modalItemText}>{event.type}</Text>
                  {eventType === event.type && (
                    <Ionicons name="checkmark" size={20} color="#FF8C42" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                  key={`category-${index}-${category.type}`}
                  style={[
                    styles.modalItem,
                    selectedTypes.includes(category.type) && styles.modalItemSelected
                  ]}
                  onPress={() => handleCategorySelect(category.type)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon} size={18} color="#fff" />
                  </View>
                  <Text style={styles.modalItemText}>{category.type}</Text>
                  {selectedTypes.includes(category.type) && (
                    <Ionicons name="checkmark" size={20} color="#FF8C42" />
                  )}
                </TouchableOpacity>

              ))}
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
  // --- Upload & Files UI ---
  uploadButton: {
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
  uploadButtonText: {
    color: '#FF8C42',
    fontWeight: '600',
    fontSize: 14,
  },
  fileList: {
    marginTop: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  fileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#334155',
  },
  fileMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  fileRemove: {
    padding: 6,
  },
  // ---
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
});
