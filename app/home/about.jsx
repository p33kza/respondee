import { View, Text, Image, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen () {
    return (
        <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
            <Image
            source={require('../../assets/images/Logo1.png')} 
            style={styles.logo}
            resizeMode="contain"
            />
        </View>

        <Text style={styles.title}>About Respondee</Text>
        
        <View style={styles.card}>
            <Ionicons name="alert-circle" size={24} color="#FF7D33" style={styles.icon} />
            <Text style={styles.cardTitle}>Complaint Resolution Made Simple</Text>
            <Text style={styles.cardText}>
            Respondee is your trusted platform for addressing complaints and logistics issues 
            efficiently. We bridge the gap between consumers and service providers to ensure 
            your concerns are heard and resolved promptly.
            </Text>
        </View>

        <View style={styles.card}>
            <Ionicons name="cube" size={24} color="#FF7D33" style={styles.icon} />
            <Text style={styles.cardTitle}>Streamlined Logistics</Text>
            <Text style={styles.cardText}>
            Our logistics solutions help businesses and individuals track, manage, and resolve 
            shipping and delivery issues with transparency and accountability.
            </Text>
        </View>

        <View style={styles.valuesSection}>
            <Text style={styles.sectionTitle}>Our Values</Text>
            
            <View style={styles.valueItem}>
            <View style={styles.valueIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#FF7D33" />
            </View>
            <Text style={styles.valueText}>Transparency in every resolution</Text>
            </View>
            
            <View style={styles.valueItem}>
            <View style={styles.valueIcon}>
                <Ionicons name="flash" size={20} color="#FF7D33" />
            </View>
            <Text style={styles.valueText}>Quick response times</Text>
            </View>
            
            <View style={styles.valueItem}>
            <View style={styles.valueIcon}>
                <Ionicons name="people" size={20} color="#FF7D33" />
            </View>
            <Text style={styles.valueText}>Customer-first approach</Text>
            </View>
        </View>

        <Text 
            style={styles.contactLink}
            onPress={() => Linking.openURL('mailto:support@respondee.com')}
        >
            Contact us at support@respondee.com
        </Text>
        </ScrollView>
    );
    };

    const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F9F9F9',
        padding: 20,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 150,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E4057', 
        textAlign: 'center',
        marginBottom: 30,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2E4057',
        marginBottom: 10,
    },
    cardText: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
    },
    icon: {
        marginBottom: 10,
    },
    valuesSection: {
        marginTop: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2E4057',
        marginBottom: 15,
        textAlign: 'center',
    },
    valueItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    valueIcon: {
        backgroundColor: '#F0F4F8',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    valueText: {
        fontSize: 16,
        color: '#2E4057',
        flex: 1,
    },
    contactLink: {
        fontSize: 16,
        color: '#FF7D33', 
        textAlign: 'center',
        marginTop: 20,
        textDecorationLine: 'underline',
    },
});