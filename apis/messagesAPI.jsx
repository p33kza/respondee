import { API_BASE_URL } from "./api";

const MESSAGES_API_URL = API_BASE_URL + '/api/messages';

export const messagesApi = {
  getAllMessages: async () => {
    const response = await fetch(MESSAGES_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  },

  getMessageById: async (id) => {
    const response = await fetch(`${MESSAGES_API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Message not found');
    }
    return response.json();
  },

  createMessage: async (messageData) => {
    const response = await fetch(MESSAGES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) {
      throw new Error('Failed to create message');
    }
    return response.json();
  },

  updateMessage: async (id, updateData) => {
    const response = await fetch(`${MESSAGES_API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error('Failed to update message');
    }
    return response.json();
  },

  patchMessage: async (id, patchData) => {
    const response = await fetch(`${MESSAGES_API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchData),
    });
    if (!response.ok) {
      throw new Error('Failed to patch message');
    }
    return response.json();
  },

  deleteMessage: async (id) => {
    const response = await fetch(`${MESSAGES_API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete message');
    }
    return response.json();
  },

  getMessagesByChatId: async (chatId) => {
    const response = await fetch(`${MESSAGES_API_URL}/chat/${chatId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages by chatId');
    }
    return response.json();
  },

  getMessagesByRequestId: async (requestId) => {
    const response = await fetch(`${MESSAGES_API_URL}/request/${requestId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages by requestId');
    }
    return response.json();
  },

  getMessagesBySenderId: async (senderId) => {
    const response = await fetch(`${MESSAGES_API_URL}/sender/${senderId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages by senderId');
    }
    return response.json();
  },

  getMessagesByReadStatus: async (isRead) => {
    const response = await fetch(`${MESSAGES_API_URL}/status/${isRead}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages by read status');
    }
    return response.json();
  },

  getUnreadMessagesByChatId: async (chatId) => {
    const response = await fetch(`${MESSAGES_API_URL}/chat/${chatId}/unread`);
    if (!response.ok) {
      throw new Error('Failed to fetch unread messages by chatId');
    }
    return response.json();
  },

  getUnreadMessagesByRequestId: async (requestId) => {
    const response = await fetch(`${MESSAGES_API_URL}/request/${requestId}/unread`);
    if (!response.ok) {
      throw new Error('Failed to fetch unread messages by requestId');
    }
    return response.json();
  },

  markMessageAsRead: async (id) => {
    const response = await fetch(`${MESSAGES_API_URL}/${id}/read`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to mark message as read');
    }
    return response.json();
  },

  markAllMessagesAsReadInChat: async (chatId) => {
    const response = await fetch(`${MESSAGES_API_URL}/chat/${chatId}/read-all`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to mark all messages as read in chat');
    }
    return response.json();
  },

  markAllMessagesAsReadInRequest: async (requestId) => {
    const response = await fetch(`${MESSAGES_API_URL}/request/${requestId}/read-all`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to mark all messages as read in request');
    }
    return response.json();
  },

  getPaginatedMessages: async (chatId, limit = 20, lastDate = null) => {
    let url = `${MESSAGES_API_URL}/chat/${chatId}/paginated?limit=${limit}`;
    if (lastDate) {
      url += `&lastDate=${lastDate}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch paginated messages');
    }
    return response.json();
  },
};