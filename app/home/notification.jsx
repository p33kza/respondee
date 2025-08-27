import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { 
  useUserNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useClearAllRead
} from '../../hooks/useNotifications';
import { useStoredUser } from '../../hooks/useStoredUser';
import { formatDateCustom, getTimestampFromFirebaseDate } from '../../helper/Formatter';
import { useRequests } from '../../hooks/useRequests';
import { useNavigation } from '@react-navigation/native';

export default function AccountScreen() {

  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { useGetRequest } = useRequests();
  const user = useStoredUser();
  
  const { 
    data: notifications, 
    isLoading, 
    refetch 
  } = useUserNotifications(user?.id);
  
  const { mutate: updateRequest } = useRequests().usePartialUpdateRequest();
  const { data: request } = useGetRequest(notifications?.requestId);
  
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: clearAllRead } = useClearAllRead();

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];

    let filtered = [...notifications];

    if (searchQuery.trim()) {
      filtered = filtered.filter(notification =>
        notification.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(notification => !notification.isRead);
        break;
      case 'read':
        filtered = filtered.filter(notification => notification.isRead);
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => {
      const aTime = getTimestampFromFirebaseDate(a.createdAt);
      const bTime = getTimestampFromFirebaseDate(b.createdAt);
      
      return bTime - aTime;
    });
  }, [notifications, searchQuery, selectedFilter]);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'request_update':
      case 'status_change':
        return 'update';
      case 'message':
      case 'response':
        return 'message';
      case 'reminder':
        return 'alarm';
      case 'system':
        return 'info';
      case 'warning':
        return 'warning';
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'request_update':
      case 'status_change':
        return '#FF9500';
      case 'message':
      case 'response':
        return '#34C759';
      case 'reminder':
        return '#FF9500';
      case 'system':
        return '#8E8E93';
      case 'warning':
        return '#FF9500';
      case 'success':
        return '#34C759';
      case 'error':
        return '#FF3B30';
      default:
        return '#FF9500';
    }
  };

  const handleNotificationPress = (notification) => {
  if (!notification.isRead) {
    markAsRead(notification.id);
  }
  
  if (notification?.requestId && notification?.requestType) {
    const requestType = notification.requestType.toLowerCase();
    
    if (requestType === 'logistics') {
      navigation.navigate('logisticsView', { requestId: notification.requestId });
    } else if (requestType === 'complaints') {
      navigation.navigate('complaintsView', { requestId: notification.requestId });
    }
    
    updateRequest(request?.id, {isRead: true, isNew: false})
  }
};

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    
    Alert.alert(
      'Mark All as Read',
      `Mark all ${unreadCount} notifications as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: () => {
            markAllAsRead(user.id, {
              onSuccess: () => {
                Alert.alert('Success', 'All notifications marked as read');
              },
              onError: (error) => {
                Alert.alert('Error', 'Failed to mark notifications as read');
                console.error(error);
              }
            });
          }
        }
      ]
    );
  };

  const handleClearAllRead = () => {
    const readCount = notifications?.filter(n => n.isRead).length || 0;
    if (readCount === 0) return;
    
    Alert.alert(
      'Clear Read Notifications',
      `Clear all ${readCount} read notifications?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          onPress: () => {
            clearAllRead(user.id, {
              onSuccess: () => {
                Alert.alert('Success', 'All read notifications cleared');
              },
              onError: (error) => {
                Alert.alert('Error', 'Failed to clear read notifications');
                console.error(error);
              }
            });
          }
        }
      ]
    );
  };

  const renderNotificationItem = (notification) => (
    <TouchableOpacity
      key={notification.id?.toString() || Math.random().toString()}
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification
      ]}
      onPress={() => {
        handleNotificationPress(notification)
      }}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name={getNotificationIcon(notification.type)}
              size={24}
              color={getNotificationColor(notification.type)}
            />
          </View>
          
          <View style={styles.notificationInfo}>
            <View style={styles.titleRow}>
              <Text style={[
                styles.notificationTitle,
                !notification.isRead && styles.unreadTitle
              ]} numberOfLines={1}>
                {notification.title || 'Notification'}
              </Text>
              {!notification.isRead && <View style={styles.unreadDot} />}
            </View>
            
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.description || 'No message content'}
            </Text>
            
            <View style={styles.notificationMeta}>
              <Text style={styles.notificationTime}>
                {formatDateCustom(notification.createdAt, 'relative')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ filter, title, icon, count }) => (
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
        color={selectedFilter === filter ? '#FFFFFF' : '#FF9500'}
      />
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.activeFilterButtonText
      ]}>
        {title}
      </Text>
      {count > 0 && (
        <View style={[
          styles.filterBadge,
          selectedFilter === filter && styles.activeFilterBadge
        ]}>
          <Text style={[
            styles.filterBadgeText,
            selectedFilter === filter && styles.activeFilterBadgeText
          ]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading && !notifications) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF9500" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons 
        name={
          searchQuery || selectedFilter !== 'all' 
            ? "search-off" 
            : selectedFilter === 'unread' 
              ? "notifications-off" 
              : "notifications"
        } 
        size={64} 
        color="#C7C7CC" 
      />
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedFilter !== 'all'
          ? "No Matching Notifications"
          : selectedFilter === 'unread'
            ? "No Unread Notifications"
            : "No Notifications"}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedFilter !== 'all'
          ? "Try adjusting your search or filters"
          : selectedFilter === 'unread'
            ? "All caught up! No new notifications."
            : "You don't have any notifications yet."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark All as Read</Text>
            </TouchableOpacity>
          )}
          {(notifications?.length - unreadCount) > 0 && (
            <TouchableOpacity onPress={handleClearAllRead} style={styles.clearAllButton}>
              <Text style={styles.clearAllText}>Clear All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notifications..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <MaterialIcons name="clear" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <FilterButton 
          filter="all" 
          title="All" 
          icon="inbox" 
          count={notifications?.length || 0} 
        />
        <FilterButton 
          filter="unread" 
          title="Unread" 
          icon="markunread" 
          count={unreadCount} 
        />
        <FilterButton 
          filter="read" 
          title="Read" 
          icon="drafts" 
          count={(notifications?.length || 0) - unreadCount} 
        />
      </View>

      <ScrollView
        style={styles.notificationsList}
        contentContainerStyle={[
          styles.notificationsContent,
          filteredNotifications.length === 0 && styles.emptyContentContainer
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(renderNotificationItem)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
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
  headerActions: {
    flexDirection: 'column',
    gap: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FF9500',
  },
  markAllText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#E5E5EA',
  },
  clearAllText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
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
    borderColor: '#FF9500',
    backgroundColor: '#FFFFFF',
  },
  activeFilterButton: {
    backgroundColor: '#FF9500',
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF9500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: '#FFFFFF',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeFilterBadgeText: {
    color: '#FF9500',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80, 
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  notificationItem: {
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
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9500',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationType: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF9500',
    letterSpacing: 0.5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100, 
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});