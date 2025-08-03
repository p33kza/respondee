import React, { useState, useMemo } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal
} from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRequests } from "../../hooks/useRequests";
import { useStoredUser } from "../../hooks/useStoredUser";
import { useNavigation } from "@react-navigation/native";
import { formatDateCustom } from "../../helper/Formatter";

export default function TrackScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const user = useStoredUser();
  
  const { useGetRequestsByUser } = useRequests();
  const { data: requests = [], loading, refetch } = useGetRequestsByUser(user?.id);
  const [refreshing, setRefreshing] = React.useState(false);

  // Improved filtering and sorting logic
  const filteredAndSortedRequests = useMemo(() => {
    if (!requests || !Array.isArray(requests)) return [];

    let filtered = [...requests];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request => {
        return (
          (request.title?.toLowerCase().includes(query)) ||
          (request.description?.toLowerCase().includes(query)) ||
          (request.id?.toString().includes(query)) ||
          (request.type?.toLowerCase().includes(query))
        );
      });
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(request => {
        if (!request.status) return false;
        return request.status.toLowerCase() === selectedStatus.toLowerCase();
      });
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(request => {
        if (!request.type) return false;
        return request.type.toLowerCase() === selectedType.toLowerCase();
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const dateA = a.dateSubmitted || a.createdAt;
      const dateB = b.dateSubmitted || b.createdAt;
      
      switch (sortBy) {
        case 'oldest':
          return new Date(dateA) - new Date(dateB);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'newest':
        default:
          return new Date(dateB) - new Date(dateA);
      }
    });
  }, [requests, searchQuery, selectedStatus, selectedType, sortBy]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (refetch && typeof refetch === 'function') {
        await refetch();
      }
    } catch (error) {
      console.error('Error refreshing requests:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedType('all');
    setSortBy('newest');
  };

  // Improved status color mapping
  const getStatusColor = (status) => {
    if (!status) return '#8f938eff';
    
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'pending':
        return '#FF9500';
      case 'in progress':
      case 'processing':
        return '#334155';
      case 'completed':
      case 'done':
        return '#34C759';
      case 'rejected':
      case 'cancelled':
      case 'denied':
        return '#FF3B30';
      default:
        return '#8f938eff';
    }
  };

  // Improved request type icon mapping
  const getRequestTypeIcon = (type) => {
    if (!type) return 'assignment';
    
    const typeLower = type.toLowerCase();
    
    switch (typeLower) {
      case 'complaint':
      case 'complaints':
        return 'report-problem';
      case 'logistic':
      case 'logistics':
        return 'local-shipping';
      case 'support':
        return 'help';
      case 'maintenance':
        return 'build';
      default:
        return 'assignment';
    }
  };

  // Improved getUniqueStatuses
  const getUniqueStatuses = () => {
    if (!requests || !Array.isArray(requests)) return [];
    
    const statuses = requests
      .map(req => req.status?.toLowerCase())
      .filter(Boolean)
      .filter((status, index, self) => self.indexOf(status) === index);
    
    return statuses;
  };

  // Improved getUniqueTypes
  const getUniqueTypes = () => {
    if (!requests || !Array.isArray(requests)) return [];
    
    const types = requests
      .map(req => req.type?.toLowerCase())
      .filter(Boolean)
      .filter((type, index, self) => self.indexOf(type) === index);
    
    return types;
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case 'oldest':
        return 'arrow-upward';
      case 'title':
        return 'sort-by-alpha';
      case 'status':
        return 'label';
      case 'newest':
      default:
        return 'arrow-downward';
    }
  };

  const RequestCard = ({ request }) => (
    <TouchableOpacity style={styles.requestCard} activeOpacity={0.7}
      onPress={() => {
        if (request.type === 'logistics') {
          navigation.navigate('logisticsView', { requestId: request.id })
        }
        if (request.type === 'complaints') {
          navigation.navigate('complaintsView', { requestId: request.id })
        }
        }
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          <MaterialIcons 
            name={getRequestTypeIcon(request.type)} 
            size={18} 
            color="#334155" 
            style={styles.typeIcon}
          />
          <Text style={styles.requestType}>
            {request.type?.toUpperCase() || 'GENERAL'}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(request.status) }
        ]}>
          <Text style={styles.statusText}>
            {request.status?.toUpperCase() || 'UNKNOWN'}
          </Text>
        </View>
      </View>

      <Text style={styles.requestTitle} numberOfLines={2}>
        {request.title || 'Untitled Request'}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          Submitted: {formatDateCustom(request.dateSubmitted || request.createdAt, 'relative')}
        </Text>
        <Text style={styles.requestId}>
          ID: {request.id?.toString().slice(-6) || 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const FilterModal = () => (
  <Modal
    visible={showFilters}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setShowFilters(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filter & Sort</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Add a container with fixed height */}
        <View style={{ height: '70%' }}>
          <ScrollView style={styles.modalBody}>
            {/* Sort Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.optionGroup}>
                {[
                  { key: 'newest', label: 'Newest First', icon: 'arrow-downward' },
                  { key: 'oldest', label: 'Oldest First', icon: 'arrow-upward' },
                  { key: 'title', label: 'Title A-Z', icon: 'sort-by-alpha' },
                  { key: 'status', label: 'Status', icon: 'label' }
                ].map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionButton,
                      sortBy === option.key && styles.selectedOption
                    ]}
                    onPress={() => setSortBy(option.key)}
                  >
                    <MaterialIcons 
                      name={option.icon} 
                      size={20} 
                      color={sortBy === option.key ? '#334155' : '#8E8E93'} 
                    />
                    <Text style={[
                      styles.optionText,
                      sortBy === option.key && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.optionGroup}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedStatus === 'all' && styles.selectedOption
                  ]}
                  onPress={() => setSelectedStatus('all')}
                >
                  <MaterialIcons 
                    name="select-all" 
                    size={20} 
                    color={selectedStatus === 'all' ? '#334155' : '#8E8E93'} 
                  />
                  <Text style={[
                    styles.optionText,
                    selectedStatus === 'all' && styles.selectedOptionText
                  ]}>
                    All Statuses
                  </Text>
                </TouchableOpacity>
                {getUniqueStatuses().map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.optionButton,
                      selectedStatus === status && styles.selectedOption
                    ]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(status) }
                    ]} />
                    <Text style={[
                      styles.optionText,
                      selectedStatus === status && styles.selectedOptionText
                    ]}>
                      {status?.charAt(0).toUpperCase() + status?.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Type Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Type</Text>
              <View style={styles.optionGroup}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedType === 'all' && styles.selectedOption
                  ]}
                  onPress={() => setSelectedType('all')}
                >
                  <MaterialIcons 
                    name="category" 
                    size={20} 
                    color={selectedType === 'all' ? '#334155' : '#8E8E93'} 
                  />
                  <Text style={[
                    styles.optionText,
                    selectedType === 'all' && styles.selectedOptionText
                  ]}>
                    All Types
                  </Text>
                </TouchableOpacity>
                {getUniqueTypes().map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      selectedType === type && styles.selectedOption
                    ]}
                    onPress={() => setSelectedType(type)}
                  >
                    <MaterialIcons 
                      name={getRequestTypeIcon(type)} 
                      size={20} 
                      color={selectedType === type ? '#334155' : '#8E8E93'} 
                    />
                    <Text style={[
                      styles.optionText,
                      selectedType === type && styles.selectedOptionText
                    ]}>
                      {type?.charAt(0).toUpperCase() + type?.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.applyButton} 
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

  if (loading && (!requests || requests.length === 0)) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#334155" />
        <Text style={styles.loadingText}>Loading your requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Track Requests</Text>
        <Text style={styles.headerSubtitle}>
          {filteredAndSortedRequests.length} of {requests?.length || 0} requests
        </Text>
      </View>

      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search requests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
              <MaterialIcons name="clear" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <MaterialIcons name={getSortIcon()} size={20} color="#ff7f2a" />
          <MaterialIcons name="filter-list" size={20} color="#ff7f2a" />
        </TouchableOpacity>
      </View>

      {(selectedStatus !== 'all' || selectedType !== 'all' || searchQuery.trim()) && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFilters}>
            {searchQuery.trim() && (
              <View style={styles.activeFilterChip}>
                <MaterialIcons name="search" size={14} color="#334155" />
                <Text style={styles.activeFilterText}>"{searchQuery}"</Text>
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="close" size={14} color="#334155" />
                </TouchableOpacity>
              </View>
            )}
            {selectedStatus !== 'all' && (
              <View style={styles.activeFilterChip}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedStatus) }]} />
                <Text style={styles.activeFilterText}>{selectedStatus}</Text>
                <TouchableOpacity onPress={() => setSelectedStatus('all')}>
                  <MaterialIcons name="close" size={14} color="#334155" />
                </TouchableOpacity>
              </View>
            )}
            {selectedType !== 'all' && (
              <View style={styles.activeFilterChip}>
                <MaterialIcons name={getRequestTypeIcon(selectedType)} size={14} color="#334155" />
                <Text style={styles.activeFilterText}>{selectedType}</Text>
                <TouchableOpacity onPress={() => setSelectedType('all')}>
                  <MaterialIcons name="close" size={14} color="#334155" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity onPress={clearAllFilters} style={styles.clearAllButton}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredAndSortedRequests && filteredAndSortedRequests.length > 0 ? (
          filteredAndSortedRequests?.map((request, index) => (
            <RequestCard key={request.id || index} request={request} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons 
              name={searchQuery || selectedStatus !== 'all' || selectedType !== 'all' ? "search-off" : "assignment"} 
              size={64} 
              color="#ec7a2fff" 
            />
            <Text style={styles.emptyTitle}>
              {searchQuery || selectedStatus !== 'all' || selectedType !== 'all' 
                ? "No Matching Requests" 
                : "No Requests Found"}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedStatus !== 'all' || selectedType !== 'all'
                ? "Try adjusting your search or filters"
                : "You haven't submitted any requests yet."}
            </Text>
            {(searchQuery || selectedStatus !== 'all' || selectedType !== 'all') && (
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <FilterModal />
    </View>
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
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 12,
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
  },
  clearSearchButton: {
    padding: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  activeFilters: {
    flex: 1,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#334155',
    marginHorizontal: 4,
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  clearAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    marginRight: 8,
  },
  requestType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  requestId: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 200,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: "#ec7a2fff",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#585858ff',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  clearFiltersButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 20,
    marginBottom: 12,
  },
  optionGroup: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: '#F2F2F7',
  },
  optionText: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 12,
    flex: 1,
  },
  selectedOptionText: {
    color: '#334155',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});