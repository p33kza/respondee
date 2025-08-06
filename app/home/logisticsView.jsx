import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRequests } from '../../hooks/useRequests';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useReturnItems } from '../../hooks/useInventory';
import { formatDateCustom } from '../../helper/Formatter';
import { useUsers } from '../../hooks/useUsers';
import { useCreateNotification } from '../../hooks/useNotifications';

const STATUS_COLORS = {
  pending: '#F59E0B',
  'in progress': '#FF8C42',
  done: '#10B981',
};

const PRIORITY_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};

export default function LogisticsDetailView() {
  const route = useRoute();
  const navigation = useNavigation();
  const { requestId } = route.params;

  const { useGetRequest, useAddMessage } = useRequests();
  const { data: request = {} } = useGetRequest(requestId);

  const { data: users = [] } = useUsers();
  const { mutate: returnItems } = useReturnItems();
  const { mutate: addNotification } = useCreateNotification();
  const { mutate: addMessage } = useAddMessage();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnQuantity, setReturnQuantity] = useState('');

  const getSenderName = (id) => {
    const user = users.find((u) => u.id === id);
    return user?.displayName || 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleReturnItem = (item) => {
    setSelectedItem(item);
    setReturnQuantity('');
    setModalVisible(true);
  };

  const handleReturnFull = () => {
    if (selectedItem) {
      setReturnQuantity(String(selectedItem.quantity));
    }
  };

  const handleConfirmReturn = () => {
    const qty = parseInt(returnQuantity, 10);

    if (!qty || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }
    if (qty > selectedItem.quantity) {
      Alert.alert('Error', 'Return quantity cannot exceed available quantity');
      return;
    }

    const returnData = {
      requestId,
      returns: [
        {
          item: selectedItem.item,
          quantity: qty,
        },
      ],
    };

    returnItems(returnData, {
      onSuccess: () => {
        Alert.alert('Success', `Returned ${qty} ${selectedItem.item}(s)`);
        
        if (request.assignedTo) {
          addNotification({
            userId: request.assignedTo,
            requestId,
            title: 'Item Returned',
            description: `${getSenderName(request.userId)} returned ${qty} ${selectedItem.item}(s)`,
          });
        }
        addMessage({
          requestId,
          messageType: 'system',
          message: `${getSenderName(request.userId)} Returned ${qty} ${selectedItem.item}(s)`,
        });
        setModalVisible(false);
        setSelectedItem(null);
        setReturnQuantity('');
      },
      onError: (err) => {
        console.error('Return error:', err);
        Alert.alert('Error', err.message || 'Failed to return item');
      },
    });
  };

  const StatusBadge = ({ status }) => (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] || '#94A3B8' }]}>
      <Text style={styles.badgeText}>{status?.toUpperCase() || 'UNKNOWN'}</Text>
    </View>
  );

  const PriorityBadge = ({ priority }) => (
    <View style={[styles.badge, { backgroundColor: PRIORITY_COLORS[priority] || '#94A3B8' }]}>
      <Text style={styles.badgeText}>{priority?.toUpperCase() || 'UNKNOWN'}</Text>
    </View>
  );

  const ItemCard = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.item}</Text>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
      </View>
      {/* Fixed: Only show return button for non-pending requests and when items are not fully returned */}
      {request?.status !== 'pending' && !request?.logisticsObj?.isReturned && (
        <TouchableOpacity style={styles.returnButton} onPress={() => handleReturnItem(item)}>
          <Text style={styles.returnButtonText}>Return</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const MessageBubble = ({ message }) => (
    <View style={styles.messageBubble}>
      <View style={styles.messageHeader}>
        <Text style={styles.senderText}>Sender: {getSenderName(message.senderId)}</Text>
        <Text style={styles.timestampText}>
          {formatDateCustom(message.timestamp, 'relative')}
        </Text>
      </View>
      <Text style={styles.messageText}>{message.message}</Text>
      {message.type && (
        <View style={[styles.messageTypeBadge, { backgroundColor: '#FFEDD5' }]}>
          <Text style={styles.messageTypeText}>{message.type}</Text>
        </View>
      )}
    </View>
  );

  const ReturnStatusIndicator = ({ isReturned }) => (
    <View style={styles.syncContainer}>
      <View
        style={[styles.syncDot, { backgroundColor: isReturned ? '#10B981' : '#F59E0B' }]}
      />
      <Text style={styles.syncText}>{isReturned ? 'Returned' : 'Not Returned'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#334155" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{request.title || 'Logistics Request'}</Text>
          <Text style={styles.requestId}>ID: {request.id}</Text>
          <View style={styles.badgeContainer}>
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{request.description || 'No description provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Assigned To:</Text>
            <Text style={styles.value}>{request.assignedTo ? getSenderName(request.assignedTo) : 'Unassigned'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Request Date:</Text>
            <Text style={styles.value}>{formatDate(request.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{request.type || 'N/A'}</Text>
          </View>
        </View>

        {request.logisticsObj && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Logistics Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Event Date:</Text>
              <Text style={styles.value}>{formatDate(request.logisticsObj.eventDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Return Date:</Text>
              <Text style={styles.value}>{formatDate(request.logisticsObj.returnDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{request.logisticsObj.location || 'Not specified'}</Text>
            </View>
            {request?.status !== 'pending' && (
              <View style={styles.statusRow}>
                <ReturnStatusIndicator isReturned={request.logisticsObj.isReturned} />
              </View>
            )}
            {request.logisticsObj.items?.length > 0 && (
              <View style={styles.itemsSection}>
                <Text style={styles.subSectionTitle}>Items Required</Text>
                <FlatList
                  data={request.logisticsObj.items}
                  keyExtractor={(item, index) => `item-${index}`}
                  renderItem={({ item }) => <ItemCard item={item} />}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>
        )}

        {request.messages?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Messages</Text>
            <FlatList
              data={request.messages}
              keyExtractor={(msg, idx) => `message-${idx}`}
              renderItem={({ item }) => <MessageBubble message={item} />}
              scrollEnabled={false}
            />
          </View>
        )}

        {request?.status === 'in progress' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() =>
                navigation.navigate('MessageView', { requestId: request.id })
              }
            >
              <Text style={styles.secondaryButtonText}>Add Message</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Return Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Return Item</Text>
            {selectedItem && (
              <View style={styles.modalItemInfo}>
                <Text style={styles.modalItemName}>{selectedItem.item}</Text>
                <Text style={styles.modalItemQuantity}>
                  Available: {selectedItem.quantity}
                </Text>
              </View>
            )}
            <Text style={styles.inputLabel}>Return Quantity:</Text>
            <TextInput
              style={styles.quantityInput}
              value={returnQuantity}
              onChangeText={setReturnQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
            />
            <TouchableOpacity style={styles.fullReturnButton} onPress={handleReturnFull}>
              <Text style={styles.fullReturnButtonText}>Return All Items</Text>
            </TouchableOpacity>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmReturn}
              >
                <Text style={styles.modalConfirmText}>Confirm Return</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
},
scrollView: {
    flex: 1,
},
header: {
    backgroundColor: '#334155',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
},
backButton: {
    marginRight: 16,
    padding: 4,
    marginTop: 4,
},
backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
},
headerContent: {
    flex: 1,
},
title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
},
requestId: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
},
badgeContainer: {
    flexDirection: 'row',
    gap: 8,
},
badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
},
badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
},
section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F8FAFC',
},
sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 16,
},
subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
    marginTop: 16,
},
infoRow: {
    marginBottom: 12,
},
label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
},
value: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
},
statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
},
syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
},
syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
},
syncText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
},
itemsSection: {
    marginTop: 8,
},
itemCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
itemInfo: {
    flex: 1,
},
itemName: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
    marginBottom: 2,
},
itemQuantity: {
    fontSize: 12,
    color: '#FF8C42',
    fontWeight: '600',
},
returnButton: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
},
returnButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
},
messageBubble: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF8C42',
},
messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
},
senderText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
},
timestampText: {
    fontSize: 12,
    color: '#94A3B8',
},
messageText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 8,
},
messageTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
},
messageTypeText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '600',
},
actionContainer: {
    padding: 16,
    paddingBottom: 32,
},
secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
},
secondaryButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
},
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
},
modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
},
modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 16,
    textAlign: 'center',
},
modalItemInfo: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
},
modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
},
modalItemQuantity: {
    fontSize: 14,
    color: '#64748B',
},
inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
},
quantityInput: {
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
},
fullReturnButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FF8C42',
},
fullReturnButtonText: {
    color: '#FF8C42',
    fontSize: 14,
    fontWeight: '600',
},
modalActions: {
    flexDirection: 'row',
    gap: 12,
},
modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#94A3B8',
},
modalCancelText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
},
modalConfirmButton: {
    flex: 1,
    backgroundColor: '#FF8C42',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
},
modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
},
});