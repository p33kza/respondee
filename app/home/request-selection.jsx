import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SelectRequestTypeScreen() {
  const router = useRouter();
  const scaleAnim1 = React.useRef(new Animated.Value(1)).current;
  const scaleAnim2 = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = (animValue) => {
    Animated.spring(animValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (animValue) => {
    Animated.spring(animValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleLogisticsPress = () => {
    router.push('/home/logistics');
  };

  const handleComplaintsPress = () => {
    router.push('/home/complaint');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent} 
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Request</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.mainContent}>
        <View style={styles.messageContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={48} color="#FF8C42" />
          </View>
          <Text style={styles.welcomeTitle}>What can we help you with?</Text>
          <Text style={styles.welcomeSubtitle}>
            Choose the type of request you'd like to submit. We're here to assist you with logistics support or address any complaints you may have.
          </Text>
        </View>

        {/* Request Type Options */}
        <View style={styles.optionsContainer}>
          {/* Logistics Option */}
          <Animated.View style={[{ transform: [{ scale: scaleAnim1 }] }]}>
            <TouchableOpacity
              style={[styles.optionCard, styles.logisticsCard]}
              onPress={handleLogisticsPress}
              onPressIn={() => handlePressIn(scaleAnim1)}
              onPressOut={() => handlePressOut(scaleAnim1)}
              activeOpacity={0.9}
            >
              <View style={styles.cardContent}>
                <View style={[styles.cardIcon, styles.logisticsIcon]}>
                  <Ionicons name="construct" size={32} color="#FFFFFF" />
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, styles.logisticsTitle]}>Request Logistics</Text>
                  <Text style={[styles.cardDescription, styles.logisticsDescription]}>
                    Need equipment, supplies, or logistical support for your events or activities
                  </Text>
                </View>
                <View style={[styles.cardArrow, styles.logisticsArrow]}>
                  <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Complaints Option */}
          <Animated.View style={[{ transform: [{ scale: scaleAnim2 }] }]}>
            <TouchableOpacity
              style={[styles.optionCard, styles.complaintsCard]}
              onPress={handleComplaintsPress}
              onPressIn={() => handlePressIn(scaleAnim2)}
              onPressOut={() => handlePressOut(scaleAnim2)}
              activeOpacity={0.9}
            >
              <View style={styles.cardContent}>
                <View style={[styles.cardIcon, styles.complaintsIcon]}>
                  <Ionicons name="warning" size={32} color="#FFFFFF" />
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, styles.complaintsTitle]}>File Complaint</Text>
                  <Text style={[styles.cardDescription, styles.complaintsDescription]}>
                    Report issues, concerns, or problems that need attention and resolution
                  </Text>
                </View>
                <View style={[styles.cardArrow, styles.complaintsArrow]}>
                  <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#64748B" />
            <Text style={styles.infoText}>Quick response within 24 hours</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" />
            <Text style={styles.infoText}>Secure and confidential handling</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="notifications-outline" size={20} color="#64748B" />
            <Text style={styles.infoText}>Real-time status updates</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
  },
  placeholder: {
    width: 40,
  },
  mainContent: {
    flex: 1,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FFEDD5',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 40,
  },
  optionCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    padding: 20,
  },
  logisticsCard: {
    backgroundColor: '#FF8C42',
  },
  complaintsCard: {
    backgroundColor: '#334155',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logisticsTitle: {
    color: '#FFFFFF',
  },
  complaintsTitle: {
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  logisticsDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  complaintsDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cardArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
    flex: 1,
  },
});