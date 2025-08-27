import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRequests } from '../../hooks/useRequests';
import { useStoredUser } from '../../hooks/useStoredUser';

export default function ResponseScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const userResult = useStoredUser();
  const user = userResult?.data || null;

  const requestsHook = useRequests();
  const { data: userRequests, isLoading, refetch } = requestsHook.useGetRequestsByUser(user?.id);
  const { refetchByUser } = requestsHook.useRefreshRequests();

  const filteredRequests = React.useMemo(() => {
    if (!userRequests) return [];

    let filtered = userRequests.filter(request => {
      return request.messages && request.messages.length > 0;
    });

    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.messages?.some(msg => 
          msg.message?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(request => !request.isRead);
        break;
      default:
        break;
    }
    return filtered.sort((a, b) => {
      const aLatest = a.messages?.[a.messages.length - 1]?.timestamp || a.createdAt;
      const bLatest = b.messages?.[b.messages.length - 1]?.timestamp || b.createdAt;
      return new Date(bLatest) - new Date(aLatest);
    });
  }, [userRequests, searchQuery, selectedFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing responses:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 168) { 
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getLatestMessage = (messages) => {
    if (!messages || messages.length === 0) return null;
    return messages[messages.length - 1];
  };

  const getSenderName = (senderId) => {
    if (senderId === user?.id) return 'You';
    return `User ${senderId?.toString().slice(-4) || 'Unknown'}`;
  };

  const getMessageTypeIcon = (messageType) => {
    switch (messageType?.toLowerCase()) {
      case 'response':
        return 'reply';
      case 'update':
        return 'update';
      case 'system':
        return 'info';
      case 'urgent':
        return 'priority-high';
      default:
        return 'message';
    }
  };

  const getMessageTypeColor = (messageType) => {
    switch (messageType?.toLowerCase()) {
      case 'response':
        return '#ff7f2a';
      case 'update':
        return '#FF9500';
      case 'system':
        return '#000000';
      case 'urgent':
        return '#FF3B30';
      default:
        return '#34C759';
    }
  };

  const handleRequestPress = (request) => {
    Alert.alert('Open Chat', `Opening chat for: ${request.title}`);
  };

  const renderRequestItem = ({ item: request }) => {
    const latestMessage = getLatestMessage(request.messages);
    if (!latestMessage) return null;

    const isUnread = !request.isRead;
    const senderName = getSenderName(latestMessage.senderId);

    return (
      <TouchableOpacity
        style={[styles.requestItem, isUnread && styles.unreadItem]}
        onPress={() => handleRequestPress(request)}
        activeOpacity={0.7}
      >
        <View style={styles.requestHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.requestTitle, isUnread && styles.unreadText]} numberOfLines={1}>
              {request.title || 'Untitled Request'}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.timeText}>
              {formatTime(latestMessage.timestamp)}
            </Text>
          </View>
        </View>

        <View style={styles.messageContainer}>
          <View style={styles.senderContainer}>
            <MaterialIcons
              name={getMessageTypeIcon(latestMessage.messageType)}
              size={14}
              color={getMessageTypeColor(latestMessage.messageType)}
              style={styles.messageTypeIcon}
            />
            <Text style={styles.senderName}>{senderName}:</Text>
          </View>
          <Text style={styles.latestMessage} numberOfLines={2}>
            {latestMessage.message || 'No message content'}
          </Text>
        </View>

        {request.messages.length > 1 && (
          <View style={styles.messageCount}>
            <MaterialIcons name="chat-bubble" size={12} color="#000000" />
            <Text style={styles.messageCountText}>
              {request.messages.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="chat" size={64} color="#ff7f2a" />
      <Text style={styles.emptyTitle}>No Messages Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedFilter !== 'all'
          ? 'No messages match your current filter'
          : 'No message responses yet'}
      </Text>
    </View>
  );

  const FilterButton = ({ filter, title, icon }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <MaterialIcons
        name={icon}
        size={16}
        color={selectedFilter === filter ? '#FFFFFF' : '#ff7f2a'}
      />
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.activeFilterButtonText
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading && !userRequests) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ff7f2a" />
          <Text style={styles.loadingText}>Loading responses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Responses</Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#000000" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#000000"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <MaterialIcons name="clear" size={20} color="#000000" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <FilterButton filter="all" title="All" icon="inbox" />
        <FilterButton filter="unread" title="Unread" icon="markunread" />
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
    color: '#000000',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#000000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff7f2a',
    backgroundColor: '#FFFFFF',
  },
  activeFilterButton: {
    backgroundColor: '#ff7f2a',
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#ff7f2a',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  requestItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#ff7f2a',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  unreadText: {
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff7f2a',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  messageContainer: {
    marginBottom: 8,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageTypeIcon: {
    marginRight: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff7f2a',
  },
  latestMessage: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 18,
  },
  messageCount: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  messageCountText: {
    fontSize: 10,
    color: '#000000',
    marginLeft: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 150,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ff7f2a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
  },
});