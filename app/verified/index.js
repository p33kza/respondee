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
import RecentActivityCarousel from './RecentActivityCarousel';
import RecentActivityList from './RecentActivityList';
import { supabase } from '../../lib/supabase'; // adjust path as needed



export default function HomeScreen() {
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(true);
  const [showFloatingIcon, setShowFloatingIcon] = useState(false);
  const actions = [
    { label: 'File Complaint', icon: 'document-text-outline', route: '/verified/complaint' },
    { label: 'Request Service', icon: 'construct-outline', route: '/request' },
    { label: 'Track Status', icon: 'time-outline', route: '/trackstatus' },
    { label: 'View Responses', icon: 'chatbox-ellipses-outline', route: '/verified/responses' },
    { label: 'FAQs / Help', icon: 'help-circle-outline', route: '/verified/faq' },
    { label: 'Feedback', icon: 'megaphone-outline', route: '/verified/feedback' },
  ];

  const [showFullList, setShowFullList] = React.useState(false);
  const [openCases, setOpenCases] = useState(0);
  const [resolvedCases, setResolvedCases] = useState(0);  

  async function fetchCaseCounts() {
    const { data: complaints, error: cError } = await supabase.from('complaints').select('*');
    const { data: requests, error: rError } = await supabase.from('requests').select('*');
  
    // if (cError || rError) {
    //   console.error('Error fetching statuses:', cError || rError);
    //   return;
    // }
  
    // console.log('Complaints data:', complaints);
    // console.log('Requests data:', requests);
  
    const combined = [...(complaints || []), ...(requests || [])];
  
    const normalize = s => s?.trim().toLowerCase();
  
    const openStatuses = ['pending', 'to verify', 'in progress'];
    const resolvedStatuses = ['settled', 'unsettled'];
  
    // Check what keys are actually in the objects
    // combined.forEach((item, idx) => {
    //   console.log(`Item ${idx} keys:`, Object.keys(item));
    //   console.log(`Item ${idx} status:`, item.status);
    // });
  
    const open = combined.filter(item => openStatuses.includes(normalize(item.status))).length;
    const resolved = combined.filter(item => resolvedStatuses.includes(normalize(item.status))).length;
  
    // console.log('Open Cases:', open);
    // console.log('Resolved Cases:', resolved);
  
    setOpenCases(open);
    setResolvedCases(resolved);
  }

  useEffect(() => {
    fetchCaseCounts();
  }, []);  

  function handleViewAll() {
    setShowFullList(true);
  }

  return (
    <SafeAreaView style={styles.container}>
       <ScrollView contentContainerStyle={styles.scrollContent}
         showsVerticalScrollIndicator={false}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/images/Logo1.png')} style={styles.secondLogo} />
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
          You can now upload images when filing a case!
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

        <View style={styles.cardRow}>
          <View style={styles.smallStatCard}>
            <Text style={styles.cardTitle}>Open Cases</Text>
            <Text style={styles.cardCount}>📄 {openCases} Pending</Text>
          </View>
          <View style={styles.smallStatCard}>
            <Text style={styles.cardTitle}>Resolved Cases</Text>
            <Text style={styles.cardCount}>✅ {resolvedCases} Completed</Text>
          </View>
        </View>

      {/* Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.recentActivityHeader]}>Recent Activity</Text>
          <RecentActivityCarousel onViewAll={handleViewAll} />
            {showFullList && (
              <RecentActivityList onClose={() => setShowFullList(false)} />
            )}
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
    width: '26%', // fit 4 per row with spacing
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
    marginBottom: -100,
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
    flexDirection: 'row',
  },
  
  logoImage: {
    width: '100%',
    height: '100%',
  },

  secondLogo: {
    width: 45,            // adjust size as needed
    height: 45,
    marginLeft: 8,        // spacing between the two logos
    resizeMode: 'contain',
  },

  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,               // Optional spacing between items
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
    marginBottom: 1,  // reduce or remove if needed
  },

  recentActivityHeader: {
    marginTop: 1,     // reduced from 20 or more
    fontWeight: 'bold',
    fontSize: 18,
  },

  smallCard: {
    flex: 0.48,
    height: 100,
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
  },
  
  // summaryCard: {
  //   backgroundColor: '#E9EDF2',
  //   borderRadius: 10,
  //   padding: 16,
  //   marginBottom: 4,
  // },
  
  // summaryHeader: {
  //   marginBottom: 4,
  // },
  
  // summaryTitle: {
  //   fontWeight: 'bold',
  //   fontSize: 16,
  //   color: '#3E4A5A',
  // },
  
  // summaryDate: {
  //   fontSize: 12,
  //   color: '#777',
  // },
  
  // statusPending: {
  //   backgroundColor: '#FFE5B4',
  //   alignSelf: 'flex-start',
  //   paddingHorizontal: 10,
  //   paddingVertical: 4,
  //   borderRadius: 20,
  //   fontSize: 12,
  //   color: '#A66C00',
  //   fontWeight: 'bold',
  //   marginBottom: 10,
  // },
  
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

  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    // color: '#3E4A5A',
    marginBottom: 4,
  },
  
  smallStatCard: {
    flex: 0.48,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: -30,
    marginTop: -20,
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
