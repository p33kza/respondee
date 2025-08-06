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
  Alert,
  Image,
} from 'react-native';
import { useRequests } from '../../hooks/useRequests';
import { useRoute, useNavigation } from '@react-navigation/native';
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

export default function ComplaintsDetailView() {
  const route = useRoute();
  const navigation = useNavigation();
  const { requestId } = route.params;

  const { useGetRequest, useAddMessage, usePartialUpdateRequest } = useRequests();
  const { data: request = {} } = useGetRequest(requestId);
  const reqID = request?.id;

  const { data: users = [] } = useUsers();
  const { mutate: addNotification } = useCreateNotification();
  const { mutate: addMessage } = useAddMessage();
  const { mutate: updateRequest } = usePartialUpdateRequest();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handleMarkSolved = () => {
    Alert.alert(
      'Mark as Solved',
      'Are you sure you want to mark this complaint as solved?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            const updateData = {
              complaintsObj: {
                isSolved: true,
              },
            };

            updateRequest({ id: reqID, ...updateData }, {
              onSuccess: () => {
                Alert.alert('Success', 'Complaint marked as solved');
                
                if (request.assignedTo) {
                  addNotification({
                    userId: request.assignedTo,
                    requestId,
                    title: 'Complaint Resolved',
                    description: `${getSenderName(request.userId)} marked the complaint as solved`,
                  });
                }
                addMessage({
                  requestId,
                  messageType: 'system',
                  message: `${getSenderName(request.userId)} marked the complaint as solved`,
                });
              },
              onError: (err) => {
                console.error('Update error:', err);
                Alert.alert('Error', err.message || 'Failed to update complaint status');
              },
            });
          },
        },
      ]
    );
  };

  const handleImagePress = (imageUri) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
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

  const ImageCard = ({ imageUri, index }) => (
    <TouchableOpacity
      style={styles.imageCard}
      onPress={() => handleImagePress(imageUri)}
    >
      <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
      <Text style={styles.imageLabel}>Image {index + 1}</Text>
    </TouchableOpacity>
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

  const SolvedStatusIndicator = ({ isSolved }) => (
    <View style={styles.syncContainer}>
      <View
        style={[styles.syncDot, { backgroundColor: isSolved ? '#10B981' : '#F59E0B' }]}
      />
      <Text style={styles.syncText}>{isSolved ? 'Solved' : 'Not Solved'}</Text>
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
          <Text style={styles.title}>{request.title || 'Complaint Request'}</Text>
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
            <Text style={styles.value}>{formatDateCustom(request.date, 'relative')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{request.type || 'N/A'}</Text>
          </View>
        </View>

        {request.complaintsObj && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Complaint Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Incident Date:</Text>
              <Text style={styles.value}>{formatDate(request.complaintsObj.incidentDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Incident Location:</Text>
              <Text style={styles.value}>{request.complaintsObj.incidentLocation || 'Not specified'}</Text>
            </View>
            {request?.status !== 'pending' && (
              <View style={styles.statusRow}>
                <SolvedStatusIndicator isSolved={request.complaintsObj.isSolved} />
                {!request.complaintsObj.isSolved && request?.status === 'in progress' && (
                  <TouchableOpacity style={styles.solveButton} onPress={handleMarkSolved}>
                    <Text style={styles.solveButtonText}>Mark as Solved</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {request.complaintsObj.images?.length > 0 && (
              <View style={styles.imagesSection}>
                <Text style={styles.subSectionTitle}>Evidence Images</Text>
                <FlatList
                  data={request.complaintsObj.images}
                  keyExtractor={(item, index) => `image-${index}`}
                  renderItem={({ item, index }) => <ImageCard imageUri={item} index={index} />}
                  numColumns={2}
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

      {/* Image Modal */}
      <Modal animationType="fade" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.imageModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
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
    alignItems: 'center',
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
  solveButton: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  solveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imagesSection: {
    marginTop: 8,
  },
  imageCard: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    marginRight: 8,
    alignItems: 'center',
    flex: 1,
    maxWidth: '48%',
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginBottom: 6,
  },
  imageLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: '95%',
    height: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});