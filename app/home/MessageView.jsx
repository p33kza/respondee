import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { formatDateCustom } from "../../helper/Formatter";
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRequests } from '../../hooks/useRequests';
import { useUser } from '../../hooks/useUsers';
import { useStoredUser } from '../../hooks/useStoredUser';
import { Ionicons } from '@expo/vector-icons';

export default function MessageView() {
    const route = useRoute();
    const storedUser = useStoredUser();
    const navigation = useNavigation();
    const { requestId } = route.params;
    const { 
        useGetRequest, 
        useGetMessages, 
        useAddMessage,
    } = useRequests();
    
    const { data: request } = useGetRequest(requestId);
    const { data: messagesData } = useGetMessages(requestId);
    const { data: handler } = useUser(request?.assignedTo);

    const addMessageMutation = useAddMessage();
    
    const [message, setMessage] = useState('');
    const scrollViewRef = useRef(null);

    const currentUserId = storedUser?.id;
    const messages = messagesData?.messages || [];

    useEffect(() => {
        setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const handleSendMessage = async () => {
        if (message.trim() === '') return;
        
        try {
        await addMessageMutation.mutateAsync({
            requestId: requestId,
            senderId: currentUserId,
            message: message.trim(),
            messageType: 'text'
        });
        setMessage('');
        } catch (error) {
        console.error('Failed to send message:', error);
        Alert.alert('Error', 'Failed to send message. Please try again.');
        }
    };

    const getMessageSenderName = (senderId) => {
        const userFirstName = handler?.displayName?.split(' ')[0];
        if (senderId === 'system') return 'System';
        if (senderId === currentUserId) return 'You';
        if (senderId !== currentUserId) return userFirstName || `User ${senderId}`;
    };

    const renderMessage = (msg, index) => {
        const isCurrentUser = msg.senderId === currentUserId;
        const isSystemMessage = msg.messageType === 'system';
        
        return (
        <View 
            key={index} 
            style={[
            styles.messageContainer,
            isCurrentUser ? styles.sentMessage : styles.receivedMessage,
            isSystemMessage && styles.systemMessage
            ]}
        >
            <View style={[
            styles.messageBubble,
            isCurrentUser ? styles.sentBubble : styles.receivedBubble,
            isSystemMessage && styles.systemBubble
            ]}>
            <View style={styles.messageHeader}>
                <Text style={[
                styles.senderName,
                isCurrentUser ? styles.sentSenderName : styles.receivedSenderName,
                isSystemMessage && styles.systemSenderName
                ]}>
                {getMessageSenderName(msg.senderId)}
                </Text>
                {msg.messageType && msg.messageType !== 'text' && (
                <View style={[styles.messageTypeBadge, styles[`${msg.messageType}Badge`]]}>
                    <Text style={styles.messageTypeText}>{msg.messageType}</Text>
                </View>
                )}
            </View>
            
            <Text style={[
                styles.messageText,
                isCurrentUser ? styles.sentMessageText : styles.receivedMessageText,
                isSystemMessage && styles.systemMessageText
            ]}>
                {msg.message}
            </Text>
            
            <Text style={[
                styles.messageTime,
                isCurrentUser ? styles.sentMessageTime : styles.receivedMessageTime,
                isSystemMessage && styles.systemMessageTime
            ]}>
                {formatDateCustom(msg.timestamp, 'relative')}
            </Text>
            </View>
        </View>
        );
    };

    const canSendMessages = request?.status !== 'done' && request?.status !== 'unsettled' && request?.status !== 'unsettled';

    return (
        <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <View style={styles.headerContent}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {request?.summary?.title || request?.title || 'Request Messages'}
                </Text>
                <Text style={styles.headerSubtitle}>
                    Handler: {handler?.displayName || handler?.name || handler?.username || 'Unassigned'}
                </Text>
                </View>
            </View>
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, index) => renderMessage(msg, index))}
            </ScrollView>

            {canSendMessages && (
                <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type your message..."
                    placeholderTextColor="#999"
                    multiline
                    maxLength={500}
                    editable={!addMessageMutation.isLoading}
                />
                <TouchableOpacity 
                    style={[
                    styles.sendButton,
                    (!message.trim() || addMessageMutation.isLoading) && styles.sendButtonDisabled
                    ]}
                    onPress={handleSendMessage}
                    disabled={!message.trim() || addMessageMutation.isLoading}
                >
                    {addMessageMutation.isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                    ) : (
                    <Text style={styles.sendButtonText}>Send</Text>
                    )}
                </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
    };

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
    },
    header: {
        backgroundColor: '#334155',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#CBD5E1',
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messagesContent: {
        paddingVertical: 16,
    },
    messageContainer: {
        marginVertical: 4,
    },
    sentMessage: {
        alignItems: 'flex-end',
    },
    receivedMessage: {
        alignItems: 'flex-start',
    },
    systemMessage: {
        alignItems: 'center',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sentBubble: {
        backgroundColor: '#334155',
        borderBottomRightRadius: 8,
    },
    receivedBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    systemBubble: {
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        maxWidth: '60%',
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    senderName: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    sentSenderName: {
        color: '#fff',
        opacity: 0.8,
    },
    receivedSenderName: {
        color: '#666',
    },
    systemSenderName: {
        color: '#888',
    },
    messageTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    messageTypeText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#fff',
    },
    systemBadge: {
        backgroundColor: '#ff9500',
    },
    messageBadge: {
        backgroundColor: '#34c759',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    sentMessageText: {
        color: '#fff',
    },
    receivedMessageText: {
        color: '#333',
    },
    systemMessageText: {
        color: '#666',
        textAlign: 'center',
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
    },
    sentMessageTime: {
        color: '#fff',
        opacity: 0.7,
        textAlign: 'right',
    },
    receivedMessageTime: {
        color: '#999',
    },
    systemMessageTime: {
        color: '#999',
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        maxHeight: 100,
        backgroundColor: '#f8f8f8',
        marginRight: 12,
    },
    sendButton: {
        backgroundColor: '#334155',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 60,
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});