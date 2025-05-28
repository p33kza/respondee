import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';  // Adjust to your supabase client path
import dayjs from 'dayjs';

const STATUS_COLORS = {
  Pending: '#F2C94C',       // yellow
  Completed: '#27AE60',     // green
  Rejected: '#EB5757',      // red
  'In Progress': '#2D9CDB', // blue
  'To Verify': '#F2994A',   // orange
  Settled: '#27AE60',       // green (same as completed)
  Unsettled: '#EB5757',     // red (same as rejected)
};

function formatDate(dateStr) {
  return dayjs(dateStr).format('MMMM D, YYYY');
}

export default function RecentActivityCarousel({ onViewAll }) {
  const [data, setData] = useState([]);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 2500); // auto scroll every 3 seconds

    return () => clearInterval(interval);
  }, [currentIndex, data.length]);

  async function fetchRecentActivities() {
    const twoDaysAgo = dayjs().subtract(2, 'day').toISOString();

    // Fetch complaints
    const { data: complaints, error: cError } = await supabase
      .from('complaints')
      .select('id, complaint_name, created_at, status, respondent_address')
    //   .gte('created_at', twoDaysAgo);

    // Fetch requests
    const { data: requests, error: rError } = await supabase
      .from('requests')
      .select('id, request_title, date_requested, status, address')
    //   .gte('date_requested', twoDaysAgo);

    if (cError || rError) {
      console.error('Error fetching recent activities:', cError || rError);
      return;
    }

    const normalizedComplaints = complaints.map(c => ({
      id: c.id,
      title: c.complaint_name,
      date: c.created_at,
      status: c.status,
      address: c.respondent_address,
      type: 'complaint',
    }));

    const normalizedRequests = requests.map(r => ({
      id: r.id,
      title: r.request_title,
      date: r.date_requested,
      status: r.status,
      address: r['addr...'] || '',
      type: 'request',
    }));

    const combined = [...normalizedComplaints, ...normalizedRequests].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    setData(combined);
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.date}>Submitted: {formatDate(item.date)}</Text>
      <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#999' }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
      <TouchableOpacity onPress={onViewAll} style={styles.viewAll}>
        <Text style={styles.viewAllText}>View All</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      horizontal
      pagingEnabled
      keyExtractor={item => `${item.type}-${item.id}`}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#e8eef4',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    width: 350,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    marginTop: 5,
    color: '#666',
  },
  statusBadge: {
    marginTop: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
  },
  address: {
    marginTop: 8,
    color: '#333',
    fontStyle: 'italic',
  },
  viewAll: {
    marginTop: 10,
  },
  viewAllText: {
    color: '#5A8FC9',
    fontWeight: 'bold',
  },
});
