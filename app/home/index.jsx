import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { ScrollView } from 'react-native';
import { useStoredUser } from '../../hooks/useStoredUser';
import { useRequests } from '../../hooks/useRequests';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const user = useStoredUser();
  const { useGetRequestsByUser } = useRequests();
  
  const { data: userRequests = [], isLoading, refetch, isRefreshing } = useGetRequestsByUser(user?.id);
  
  const [refreshing, setRefreshing] = useState(false);

  const actions = [
    { label: 'File Complaint', icon: 'document-text-outline', route: '/home/complaint' },
    { label: 'Request Logistics', icon: 'construct-outline', route: '/home/logistics' } , 
    { label: 'My Requests', icon: 'document-outline', route: '/home/track' },
    { label: 'About Respondee', icon: 'chatbox-outline', route: '/home/about' },
  ];

  const stats = {
    pending: userRequests.filter(req => req.status === 'pending').length,
    inProgress: userRequests.filter(req => req.status === 'in progress').length,
    completed: userRequests.filter(req => req.status === 'done').length,
    total: userRequests.length,
    unread: userRequests.filter(req => !req.isRead).length,
    starred: userRequests.filter(req => req.isStarred).length,
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF8C42';
      case 'in progress': return '#4A90E2';
      case 'done': return '#28A745';
      default: return '#6C757D';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#DC3545';
      case 'medium': return '#FFC107';
      case 'low': return '#28A745';
      default: return '#6C757D';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderRequestCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.requestCard}
      onPress={() => {
        if (item.type === 'logistics') {
          navigation.navigate('logisticsView', { requestId: item.id });
        } else {
          navigation.navigate('complaintsView', { requestId: item.id });
        }
      }}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestTitleRow}>
          <Text style={styles.requestTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.requestDate}>{formatDate(item.date)}</Text>
      </View>
      
      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.requestFooter}>
        <View style={styles.requestMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
          
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
              {item.priority}
            </Text>
          </View>
          
          <View style={styles.typeBadge}>
            <Ionicons 
              name={item.type === 'logistics' ? 'construct' : 'warning'} 
              size={12} 
              color="#334155" 
            />
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
        
        {item.messages && item.messages.length > 0 && (
          <View style={styles.messageIndicator}>
            <Ionicons name="chatbubble-outline" size={14} color="#64748B" />
            <Text style={styles.messageCount}>{item.messages.length}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const recentRequests = userRequests
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

 

  const isVerified = user?.adminVerified !== false;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/Logo.png')} style={styles.logoImage} />
        </View>

        {/* Profile */}
        <View style={styles.profileRow}>
          <View style={styles.profileInfo}>
            <Ionicons name="person-circle-outline" size={70} color="#334155" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.name}>{user?.displayName || 'User'}</Text>
            </View>
          </View>
          <Image source={require('../../assets/images/176.png')} style={styles.promoImage} />
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.iconGrid}>
            {actions.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.iconAction}
                onPress={isVerified ? () => router.push(item.route) : undefined}
                disabled={!isVerified}
                activeOpacity={isVerified ? 0.7 : 1}
              >
                <View style={[styles.iconCircle, !isVerified && { opacity: 0.5 }]}>
                  <Ionicons name={item.icon} size={24} color="#FF8C42" />
                </View>
                <Text style={[styles.iconLabel, !isVerified && { color: '#94A3B8' }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dashboard Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Request Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.pendingCard]}>
              <View style={styles.statHeader}>
                <Ionicons name="time-outline" size={24} color="#FF8C42" />
                <Text style={styles.statValue}>{stats.pending}</Text>
              </View>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            
            <View style={[styles.statCard, styles.progressCard]}>
              <View style={styles.statHeader}>
                <Ionicons name="construct-outline" size={24} color="#4A90E2" />
                <Text style={styles.statValue}>{stats.inProgress}</Text>
              </View>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            
            <View style={[styles.statCard, styles.completedCard]}>
              <View style={styles.statHeader}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#28A745" />
                <Text style={styles.statValue}>{stats.completed}</Text>
              </View>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={[styles.statCard, styles.totalCard]}>
              <View style={styles.statHeader}>
                <Ionicons name="document-text-outline" size={24} color="#334155" />
                <Text style={styles.statValue}>{stats.total}</Text>
              </View>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Recent Requests */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Requests</Text>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
          ) : recentRequests.length > 0 ? (
            <View style={styles.requestsList}>
              {recentRequests.map(item => (
                <View key={item.id} >
                  {/* Preview only if not verified, disable clicks */}
                  <TouchableOpacity
                    disabled={!isVerified}
                    activeOpacity={isVerified ? 0.7 : 1}
                    style={!isVerified ? { opacity: 0.5 } : undefined}
                    onPress={
                      isVerified
                        ? () => {
                            if (item.type === 'logistics') {
                              navigation.navigate('logisticsView', { requestId: item.id });
                            } else {
                              navigation.navigate('complaintsView', { requestId: item.id });
                            }
                          }
                        : undefined
                    }
                  >
                    {renderRequestCard({ item })}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Requests Yet</Text>
              <Text style={styles.emptyText}>
                Start by filing a complaint or requesting logistics support
              </Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={isVerified ? () => router.push('/home/complaint') : undefined}
                disabled={!isVerified}
              >
                <Text style={styles.createButtonText}>Create Request</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 140,
    height: 50,
    resizeMode: 'contain',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  name: {
    maxWidth: 190,
    color: '#334155',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifyText: {
    fontSize: 12,
    color: '#FF8C42',
    fontWeight: '500',
    marginRight: 4,
  },
  promoImage: {
    width: 80,
    height: 60,
    resizeMode: 'contain',
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 16,
  },
  iconGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconAction: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  iconLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#334155',
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  pendingCard: {
    borderLeftWidth: 1,
    borderLeftColor: '#FF8C42',
  },
  progressCard: {
    borderLeftWidth: 1,
    borderLeftColor: '#4A90E2',
  },
  completedCard: {
    borderLeftWidth: 1,
    borderLeftColor: '#28A745',
  },
  totalCard: {
    borderLeftWidth: 1,
    borderLeftColor: '#334155',
  },
  recentSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF8C42',
    fontWeight: '500',
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    marginBottom: 8,
  },
  requestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  starIcon: {
    marginLeft: 8,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8C42',
    marginLeft: 8,
  },
  requestDate: {
    fontSize: 12,
    color: '#64748B',
  },
  requestDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  messageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messageCount: {
    fontSize: 12,
    color: '#64748B',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activitySection: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  activityButton: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  activityButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});