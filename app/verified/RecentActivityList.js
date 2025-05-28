import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { supabase } from '../../lib/supabase';
import dayjs from 'dayjs';

const STATUS_COLORS = {
  Pending: '#F2C94C',
  Completed: '#27AE60',
  Rejected: '#EB5757',
  'In Progress': '#2D9CDB',
};

function formatDate(dateStr) {
  return dayjs(dateStr).format('MMMM D, YYYY');
}

export default function RecentActivityList({ onClose }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  async function fetchRecentActivities() {
    const twoDaysAgo = dayjs().subtract(2, 'day').toISOString();

    const { data: complaints, error: cError } = await supabase
      .from('complaints')
      .select('id, complaint_name, created_at, status, respondent_address')
    //   .gte('created_at', twoDaysAgo);

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
    <View style={styles.listItem}>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.date}>Submitted: {formatDate(item.date)}</Text>
      <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#999' }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
    </View>
  );

  return (
    <Modal visible animationType="slide">
      <View style={styles.container}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Recent Activity - Last 2 Days</Text>

        <FlatList
          data={data}
          keyExtractor={item => `${item.type}-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  closeButton: {
    paddingVertical: 10,
    alignSelf: 'flex-end',
  },
  closeText: {
    color: '#5A8FC9',
    fontWeight: 'bold',
    fontSize: 16,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  listItem: {
    backgroundColor: '#e8eef4',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
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
});
