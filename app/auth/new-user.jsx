import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import ConfettiCannon from 'react-native-confetti-cannon';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  FlatList,
  Alert,
  Modal
} from 'react-native';
import { useStoredUser } from '../../hooks/useStoredUser';
import { router } from 'expo-router';
import { useSetUserNotNew } from '../../hooks/useUsers';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TutorialScreen() {
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const user = useStoredUser();
    const { mutate: setUserNotNewMutation, isPending: isUpdating } = useSetUserNotNew();
    const [currentStep, setCurrentStep] = useState(0);
    const scrollViewRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulseAnimation = Animated.loop(
        Animated.sequence([
            Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
            }),
        ])
        );
        pulseAnimation.start();

        return () => pulseAnimation.stop();
    }, [currentStep]);

    const tutorialSteps = [
        {
        id: 0,
        title: "",
        subtitle: "",
        description: "",
        component: "welcome"
        },
        {
        id: 1,
        title: "Step 1: Create New Request",
        subtitle: "The plus button is your starting point",
        description: "Tap the plus button (highlighted below) to start a new request. This is where you can request logistics support or file complaints.",
        component: "homeDemo"
        },
        {
        id: 2,
        title: "Step 2: Choose Request Type",
        subtitle: "Select what you need help with",
        description: "Choose between Logistics (for equipment and supplies) or Complaints (for issues that need attention).",
        component: "requestTypeDemo"
        },
        {
        id: 3,
        title: "Step 3: Track Your Requests",
        subtitle: "Stay updated on your submissions",
        description: "View all your requests, check their status, and use filters to find specific ones quickly.",
        component: "trackDemo"
        }
    ];

    const handleNext = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
        } else {
            setUserNotNewMutation(user?.id, {
                onSuccess: () => {
                    setShowWelcomeModal(true);
                },
                onError: (error) => {
                    Alert.alert('Failed to update user', error.message);
                },
            });
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
        }
    };

    const handleSkip = () => {
        setUserNotNewMutation(user?.id, {
            onSuccess: () => {
                setShowWelcomeModal(true);
            },
            onError: (error) => {
                Alert.alert('Failed to update user', error.message);
            },
        });
    };

    const renderWelcome = () => (
        <View style={styles.welcomeContainer}>
        <View style={styles.welcomeIconContainer}>
            <Image source={require('../../assets/images/Logo1.png')} style={{width: 80, height: 80}} />
        </View>
        <Text style={styles.welcomeTitle}>Welcome to Respondee!</Text>
        <Text style={styles.welcomeDescription}>
            This quick tutorial will show you how to create requests, track their progress, and manage your submissions effectively.
        </Text>
        <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
            <Ionicons name="add-circle" size={24} color="#FF8C42" />
            <Text style={styles.featureText}>Create requests easily</Text>
            </View>
            <View style={styles.featureItem}>
            <Ionicons name="list" size={24} color="#4A90E2" />
            <Text style={styles.featureText}>Track request status</Text>
            </View>
            <View style={styles.featureItem}>
            <Ionicons name="notifications" size={24} color="#28A745" />
            <Text style={styles.featureText}>Get real-time updates</Text>
            </View>
        </View>
        </View>
    );

    const renderHomeDemo = () => (
        <ScrollView style={styles.demoContainer} ref={scrollViewRef}>
        {/* Mock Home Screen */}
        <View style={styles.mockScreen}>
            {/* Profile */}
            <View style={styles.profileRow}>
            <View style={styles.profileInfo}>
                <Ionicons name="person-circle-outline" size={70} color="#334155" />
                <View style={{ marginLeft: 12 }}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.name}>User</Text>
                </View>
            </View>
            <Image source={require('../../assets/images/Logo1.png')} style={{width: 70, height: 70}} />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.iconGrid}>
                <View style={styles.iconAction}>
                <View style={styles.iconCircle}>
                    <Ionicons name="document" size={24} color="#FF8C42" />
                </View>
                <Text style={styles.iconLabel}>File Complaints</Text>
                </View>
                <View style={styles.iconAction}>
                <View style={styles.iconCircle}>
                    <Ionicons name="time" size={24} color="#FF8C42" />
                </View>
                <Text style={styles.iconLabel}>Request Logistics</Text>
                </View>
                <View style={styles.iconAction}>
                <View style={styles.iconCircle}>
                    <Ionicons name="notifications" size={24} color="#FF8C42" />
                </View>
                <Text style={styles.iconLabel}>My Requests</Text>
                </View>
            </View>
            </View>

            {/* Stats */}
            <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Request Overview</Text>
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, styles.pendingCard]}>
                <View style={styles.statHeader}>
                    <Ionicons name="time-outline" size={24} color="#FF8C42" />
                    <Text style={styles.statValue}>3</Text>
                </View>
                <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={[styles.statCard, styles.completedCard]}>
                <View style={styles.statHeader}>
                    <Ionicons name="checkmark-circle" size={24} color="#28A745" />
                    <Text style={styles.statValue}>7</Text>
                </View>
                <Text style={styles.statLabel}>Completed</Text>
                </View>
            </View>
            </View>
        </View>

        {/* Floating Action Button - Highlighted */}
        <Animated.View style={[
            styles.floatingButton,
            { transform: [{ scale: pulseAnim }] }
        ]}>
            <TouchableOpacity style={styles.fabButton}>
            <Ionicons name="add-outline" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.highlightTooltip}>
            <Text style={styles.tooltipText}>Tap here to create a new request!</Text>
            </View>
        </Animated.View>
        </ScrollView>
    );

    const renderRequestTypeDemo = () => (
        <ScrollView style={styles.demoContainer}>
        <View style={styles.mockScreen}>
            {/* Header */}
            <View style={styles.header}>
            <Text style={styles.headerTitle}>New Request</Text>
            </View>

            {/* Welcome Message */}
            <View style={styles.messageContainer}>
            <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={48} color="#FF8C42" />
            </View>
            <Text style={styles.welcomeTitle}>What can we help you with?</Text>
            <Text style={styles.welcomeSubtitle}>
                Choose the type of request you'd like to submit.
            </Text>
            </View>

            {/* Request Type Options - Highlighted */}
            <Animated.View style={[
            styles.optionsContainer,
            { transform: [{ scale: pulseAnim }] }
            ]}>
            {/* Logistics Option */}
            <TouchableOpacity style={[styles.optionCard, styles.logisticsCard]}>
                <View style={styles.cardContent}>
                <View style={[styles.cardIcon, styles.logisticsIcon]}>
                    <Ionicons name="construct" size={32} color="#FFFFFF" />
                </View>
                <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, styles.logisticsTitle]}>Request Logistics</Text>
                    <Text style={[styles.cardDescription, styles.logisticsDescription]}>
                    Need equipment, supplies, or logistical support
                    </Text>
                </View>
                <View style={[styles.cardArrow, styles.logisticsArrow]}>
                    <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </View>
                </View>
            </TouchableOpacity>

            {/* Complaints Option */}
            <TouchableOpacity style={[styles.optionCard, styles.complaintsCard]}>
                <View style={styles.cardContent}>
                <View style={[styles.cardIcon, styles.complaintsIcon]}>
                    <Ionicons name="warning" size={32} color="#FFFFFF" />
                </View>
                <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, styles.complaintsTitle]}>File Complaint</Text>
                    <Text style={[styles.cardDescription, styles.complaintsDescription]}>
                    Report issues that need attention
                    </Text>
                </View>
                <View style={[styles.cardArrow, styles.complaintsArrow]}>
                    <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </View>
                </View>
            </TouchableOpacity>
            </Animated.View>

            <View style={styles.highlightTooltip}>
            <Text style={styles.tooltipText}>Choose the option that matches your need</Text>
            </View>
        </View>
        </ScrollView>
    );

    const renderTrackDemo = () => (
        <ScrollView style={styles.demoContainer}>
        <Animated.View style={[
            styles.mockScreen,
            { transform: [{ scale: pulseAnim }] }
        ]}>
            {/* Header */}
            <View style={styles.trackHeader}>
            <Text style={styles.trackHeaderTitle}>Track Requests</Text>
            <Text style={styles.trackHeaderSubtitle}>3 of 10 requests</Text>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchFilterContainer}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#8E8E93" />
                <Text style={styles.searchPlaceholder}>Search requests...</Text>
            </View>
            <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="filter-outline" size={20} color="#FF8C42" />
            </TouchableOpacity>
            </View>

            {/* Request Cards */}
            <View style={styles.requestsList}>
            <View style={styles.requestCard}>
                <View style={styles.cardHeader}>
                <View style={styles.typeContainer}>
                    <Ionicons name="construct" size={18} color="#334155" />
                    <Text style={styles.requestType}>LOGISTICS</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#FF9500' }]}>
                    <Text style={styles.statusText}>PENDING</Text>
                </View>
                </View>
                <Text style={styles.requestTitle}>Equipment for Annual Event</Text>
                <View style={styles.cardFooter}>
                <Text style={styles.dateText}>Submitted: 2 days ago</Text>
                <Text style={styles.requestId}>ID: REQ001</Text>
                </View>
            </View>

            <View style={styles.requestCard}>
                <View style={styles.cardHeader}>
                <View style={styles.typeContainer}>
                    <Ionicons name="warning" size={18} color="#334155" />
                    <Text style={styles.requestType}>COMPLAINT</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#34C759' }]}>
                    <Text style={styles.statusText}>COMPLETED</Text>
                </View>
                </View>
                <Text style={styles.requestTitle}>Facility Maintenance Issue</Text>
                <View style={styles.cardFooter}>
                <Text style={styles.dateText}>Submitted: 1 week ago</Text>
                <Text style={styles.requestId}>ID: REQ002</Text>
                </View>
            </View>
            </View>

            <View style={styles.highlightTooltip}>
            <Text style={styles.tooltipText}>View and manage all your requests here</Text>
            </View>
        </Animated.View>
        </ScrollView>
    );

    const renderCurrentStep = () => {
        const step = tutorialSteps[currentStep];
        switch (step.component) {
        case 'welcome':
            return renderWelcome();
        case 'homeDemo':
            return renderHomeDemo();
        case 'requestTypeDemo':
            return renderRequestTypeDemo();
        case 'trackDemo':
            return renderTrackDemo();
        default:
            return renderWelcome();
        }
    };

    const currentStepData = tutorialSteps[currentStep];

    return (
        <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.tutorialHeader}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip Tutorial</Text>
            </TouchableOpacity>
            <View style={styles.stepIndicator}>
            {tutorialSteps.map((_, index) => (
                <View
                key={index}
                style={[
                    styles.stepDot,
                    index === currentStep ? styles.activeDot : styles.inactiveDot
                ]}
                />
            ))}
            </View>
            <View style={styles.placeholder} />
        </View>

        {/* Step Info */}
        <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
            <Text style={styles.stepDescription}>{currentStepData.description}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
            {renderCurrentStep()}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
            <TouchableOpacity
            onPress={handlePrevious}
            style={[styles.navButton, currentStep === 0 && styles.disabledButton]}
            disabled={currentStep === 0}
            >
            <Text style={[styles.navButtonText, currentStep === 0 && styles.disabledText]}>
                Previous
            </Text>
            </TouchableOpacity>

            <Text style={styles.stepCounter}>
            {currentStep + 1} of {tutorialSteps.length}
            </Text>

            <TouchableOpacity onPress={handleNext} style={styles.nextButton} disabled={isUpdating}>
            <Text style={styles.nextButtonText}>
                {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            </TouchableOpacity>
        </View>
        <Modal
            visible={showWelcomeModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowWelcomeModal(false)}
            >
            <View style={styles.modalOverlay}>
                <View style={styles.welcomeModal}>
                <View style={styles.welcomeModalIcon}>
                    <Image 
                    source={require('../../assets/images/Logo1.png')} 
                    style={{ width: 80, height: 80 }}
                    />
                </View>
                
                <Text style={styles.welcomeModalTitle}>Welcome to Respondee!</Text>
                
                <Text style={styles.welcomeModalText}>
                    You're all set to start using the app. We're excited to have you on board!
                </Text>
                
                <TouchableOpacity 
                    style={styles.welcomeModalButton}
                    onPress={() => {
                    setShowWelcomeModal(false);
                    router.push('/home');
                    }}
                >
                    <Text style={styles.welcomeModalButtonText}>Get Started</Text>
                </TouchableOpacity>
                </View>
            </View>
        </Modal>
        {showWelcomeModal && (
            <ConfettiCannon
                count={200}
                origin={{ x: screenWidth / 2, y: 0 }}
                fadeOut={true}
                autoStart={true}
            />
        )}
        </SafeAreaView>
    );
    };

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    tutorialHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    skipText: {
        fontSize: 16,
        color: '#8E8E93',
    },
    stepIndicator: {
        flexDirection: 'row',
        gap: 8,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        backgroundColor: '#FF8C42',
    },
    inactiveDot: {
        backgroundColor: '#E5E5EA',
    },
    placeholder: {
        width: 60,
    },
    stepInfo: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#F8F9FA',
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 4,
    },
    stepSubtitle: {
        fontSize: 16,
        color: '#FF8C42',
        fontWeight: '600',
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    content: {
        flex: 1,
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        backgroundColor: '#FFFFFF',
    },
    navButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    disabledButton: {
        opacity: 0.5,
    },
    navButtonText: {
        fontSize: 16,
        color: '#334155',
        fontWeight: '500',
    },
    disabledText: {
        color: '#8E8E93',
    },
    nextButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#FF8C42',
    },
    nextButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    stepCounter: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },

    welcomeContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 80,
        paddingBottom: 100
    },
    welcomeIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFEDD5',
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#334155',
        textAlign: 'center',
        marginBottom: 16,
    },
    welcomeDescription: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    featuresContainer: {
        gap: 20,
        width: '100%',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    featureText: {
        fontSize: 16,
        color: '#334155',
        marginLeft: 12,
        fontWeight: '500',
    },

    demoContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    mockScreen: {
        padding: 20,
        paddingBottom: 100,
    },
    mockLogo: {
        width: 140,
        height: 50,
        borderRadius: 8,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
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
        borderRadius: 8,
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
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
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
        borderLeftWidth: 4,
        borderLeftColor: '#FF8C42',
    },
    completedCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#28A745',
    },

    floatingButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        alignItems: 'center',
    },
    fabButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FF8C42',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },

    highlightTooltip: {
        backgroundColor: '#334155',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
        alignSelf: 'center',
        maxWidth: screenWidth * 0.8,
    },
    tooltipText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    tooltipArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#334155',
        alignSelf: 'center',
        marginTop: -12,
        marginBottom: 12,
    },

    header: {
        marginBottom: 32,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#334155',
        textAlign: 'center',
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

    trackHeader: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        marginBottom: 16,
    },
    trackHeaderTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    trackHeaderSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    searchFilterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    searchPlaceholder: {
        fontSize: 16,
        color: '#8E8E93',
        marginLeft: 8,
        flex: 1,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    requestsList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    requestCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
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
    requestType: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
        letterSpacing: 0.5,
        marginLeft: 8,
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    welcomeModal: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    welcomeModalIcon: {
    marginBottom: 20,
    },
    welcomeModalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 15,
        textAlign: 'center',
    },
    welcomeModalText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24,
    },
    welcomeModalButton: {
        backgroundColor: '#FF8C42',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    welcomeModalButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});