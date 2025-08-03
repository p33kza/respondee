import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { ScrollView } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(true);
  const [showFloatingIcon, setShowFloatingIcon] = useState(false);
  const actions = [
    { label: 'File Complaint', icon: 'document-text-outline', route: '/verified/complaint' },
    { label: 'Request Service', icon: 'construct-outline', route: '/verified/request' },
    { label: 'Track Status', icon: 'time-outline', route: '/track' },
    { label: 'View Responses', icon: 'chatbox-ellipses-outline', route: '/verified/responses' },
    { label: 'Map Issues', icon: 'map-outline', route: '/verified/map' },
    { label: 'Analytics / Stats', icon: 'stats-chart-outline', route: '/verified/analytics' },
    { label: 'FAQs / Help', icon: 'help-circle-outline', route: '/verified/faq' },
    { label: 'Feedback', icon: 'megaphone-outline', route: '/verified/feedback' },
  ];

  return (
    <SafeAreaView style={styles.container}>
       <ScrollView contentContainerStyle={styles.scrollContent}
         showsVerticalScrollIndicator={false}>
      {/* Logo */}
      <View style={styles.logoContainer}>
      <Image source={require('../../assets/images/Logo.png')} style={styles.promoImage} />
</View>

      {/* Profile */}
      <View style={styles.profileRow}>
        <View style={styles.profileInfo}>
          <Ionicons name="person-circle-outline" size={70} color="#3E4A5A" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.name}>Hi, Name</Text>
            <Text style={styles.verifyText}>+639222555100</Text>
          </View>
        </View>
        <Image source={require('../../assets/images/176.png')} style={styles.promoImage1} />
      </View>



      {/* Announcement */}
      <View style={styles.announcement}>
        <Text style={styles.announcementTitle}>🚀 New Feature</Text>
        <Text style={styles.announcementText}>
          You can now upload images when filing a complaint!
        </Text>
      </View>

        {/* Grid of Circular Icons */}
        <View style={styles.iconGrid}>
  {actions.map((item, i) => (
    <TouchableOpacity
      key={i}
      style={styles.iconAction}
      onPress={() => router.push(item.route)}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={item.icon} size={24} color="#FE712D" />
      </View>
      <Text style={styles.iconLabel}>{item.label}</Text>
    </TouchableOpacity>
  ))}
</View>

<View style={styles.summaryCard}>
  <View style={styles.summaryHeader}>
    <Text style={styles.summaryTitle}>Streetlight Not Working</Text>
    <Text style={styles.summaryDate}>Submitted: March 28, 2025</Text>
  </View>
  <Text style={styles.statusPending}>🔄 Pending</Text>
  <TouchableOpacity style={styles.viewAllBtn}>
    <Text style={styles.viewAllText}>📄 View All</Text>
  </TouchableOpacity>
</View>

<View style={styles.cardRow}>
  <View style={styles.smallStatCard}>
    <Text style={styles.statLabel}>Open Requests</Text>
    <Text style={styles.statValue}>🔄 3 Pending</Text>
  </View>
  <View style={styles.smallStatCard}>
    <Text style={styles.statLabel}>Resolved Requests</Text>
    <Text style={styles.statValue}>✅ 12 Completed</Text>
  </View>
</View>

      {/* Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.sectionSubtitle}>No recent activity yet</Text>
      </View>

      <View style={{ flex: 1 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFC',
    padding: 24,
  },
  iconAction: {
    alignItems: 'center',
    width: '14%', // fit 4 per row with spacing
    marginBottom: 20,
  },
    
  iconLabel: {
    fontSize: 10,
    textAlign: 'center',
    color: '#3E4A5A',
  },
  scrollContent: {
    paddingBottom: 150, // so last item doesn't get hidden behind verifyBanner
  },
  
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: '#FE712D',
    fontWeight: 'bold',
    fontSize: 14,
  },

  promoImage: {
    width: 140,        // ⬅️ increased from 60
    height: 50,       // ⬅️ increased from 60
    borderRadius: 60,  // optional for rounded corners
    resizeMode: 'contain',
  },
  
  promoImage1: {
    width: 100,        // ⬅️ increased from 60
    height: 80,       // ⬅️ increased from 60
    borderRadius: 60,  // optional for rounded corners
    resizeMode: 'contain',
  },

  
  dismiss: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
  },

  
  announcement: {
    backgroundColor: '#D0E6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 20,
  },
  announcementTitle: {
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  announcementText: {
    color: '#1E3A8A',
    fontSize: 12,
  },
  
  section: {
    marginBottom: 24,
    marginTop: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#3E4A5A',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#777',
  },
  floatingBubble: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  logoContainer: {
    width: 160,
    height: 40,
    marginBottom: 24,
  },
  
  logoImage: {
    width: '100%',
    height: '100%',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 30,               // Optional spacing between items
    marginBottom: 20,
  },
  

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFECE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  wideBanner: {
    height: 100,
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    marginBottom: 20,
  },
  
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  smallCard: {
    flex: 0.48,
    height: 100,
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
  },
  
  summaryCard: {
    backgroundColor: '#E9EDF2',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  
  summaryHeader: {
    marginBottom: 8,
  },
  
  summaryTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3E4A5A',
  },
  
  summaryDate: {
    fontSize: 12,
    color: '#777',
  },
  
  statusPending: {
    backgroundColor: '#FFE5B4',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    color: '#A66C00',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  
  viewAllBtn: {
    alignSelf: 'flex-end',
  },
  
  viewAllText: {
    fontSize: 12,
    color: '#FE712D',
  },
  
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  
  smallStatCard: {
    flex: 0.48,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  
  statLabel: {
    fontSize: 14,
    color: '#3E4A5A',
    fontWeight: '600',
    marginBottom: 6,
  },
  
  statValue: {
    fontSize: 12,
    color: '#5B6B7F',
  },
  
});
