import { API_BASE_URL } from "./api";

const API_REQUEST_URL = API_BASE_URL + '/api/requests';

export const requestsApi = {
  getAll: async () => {
    const response = await fetch(API_REQUEST_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch requests');
    }
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_REQUEST_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch request with ID ${id}`);
    }
    return response.json();
  },

  create: async (requestData) => {
    const response = await fetch(API_REQUEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      throw new Error('Failed to create request');
    }
    return response.json();
  },

  update: async (id, requestData) => {
    const response = await fetch(`${API_REQUEST_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update request with ID ${id}`);
    }
    return response.json();
  },

  partialUpdate: async (id, requestData) => {
    const response = await fetch(`${API_REQUEST_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      throw new Error(`Failed to partially update request with ID ${id}`);
    }
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_REQUEST_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete request with ID ${id}`);
    }
    return { id };
  },

  getByUserId: async (userId) => {
    const response = await fetch(`${API_REQUEST_URL}/user/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch requests for user ${userId}`);
    }
    return response.json();
  },

  getByStatus: async (status) => {
    const response = await fetch(`${API_REQUEST_URL}/status/${status}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch requests with status ${status}`);
    }
    return response.json();
  },

  getByPriority: async (priority) => {
    const response = await fetch(`${API_REQUEST_URL}/priority/${priority}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch requests with priority ${priority}`);
    }
    return response.json();
  },

  getByType: async (type) => {
    const response = await fetch(`${API_REQUEST_URL}/type/${type}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch requests of type ${type}`);
    }
    return response.json();
  },

  getByAssignedTo: async (assignedTo) => {
    const response = await fetch(`${API_REQUEST_URL}/assigned/${assignedTo}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch requests assigned to ${assignedTo}`);
    }
    return response.json();
  },

  getStarred: async () => {
    const response = await fetch(`${API_REQUEST_URL}/starred/true`);
    if (!response.ok) {
      throw new Error('Failed to fetch starred requests');
    }
    return response.json();
  },

  getSpam: async () => {
    const response = await fetch(`${API_REQUEST_URL}/spam/true`);
    if (!response.ok) {
      throw new Error('Failed to fetch spam requests');
    }
    return response.json();
  },

  getUnread: async () => {
    const response = await fetch(`${API_REQUEST_URL}/unread/true`);
    if (!response.ok) {
      throw new Error('Failed to fetch unread requests');
    }
    return response.json();
  },

  getNew: async () => {
    const response = await fetch(`${API_REQUEST_URL}/new/true`);
    if (!response.ok) {
      throw new Error('Failed to fetch new requests');
    }
    return response.json();
  },

  getByLabel: async (label) => {
    const response = await fetch(`${API_REQUEST_URL}/label/${label}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch requests with label ${label}`);
    }
    return response.json();
  },

  markAsRead: async (id) => {
    const response = await fetch(`${API_REQUEST_URL}/${id}/read`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error(`Failed to mark request ${id} as read`);
    }
    return response.json();
  },

  toggleStar: async (id) => {
    const response = await fetch(`${API_REQUEST_URL}/${id}/star`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error(`Failed to toggle star status for request ${id}`);
    }
    return response.json();
  },

  toggleSpam: async (id) => {
    const response = await fetch(`${API_REQUEST_URL}/${id}/spam`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error(`Failed to toggle spam status for request ${id}`);
    }
    return response.json();
  },

  assignRequest: async (id, assignedTo, status = 'in progress') => {
    const response = await fetch(`${API_REQUEST_URL}/${id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assignedTo, status }),
    });
    if (!response.ok) {
      throw new Error(`Failed to assign request ${id}`);
    }
    return response.json();
  },

  updateLabel: async (id, labelAs) => {
    const response = await fetch(`${API_REQUEST_URL}/${id}/label`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labelAs }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update label for request ${id}`);
    }
    return response.json();
  },

  updateLogisticsSync: async (id, isSynced) => {
    const response = await fetch(`${API_REQUEST_URL}/${id}/logistics/sync`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isSynced }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update sync status for request ${id}`);
    }
    return response.json();
  },

  updateLogisticsReturn: async (id, isReturned) => {
    const response = await fetch(`${API_REQUEST_URL}/${id}/logistics/return`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isReturned }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update return status for request ${id}`);
    }
    return response.json();
  },

  filterRequests: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const response = await fetch(`${API_REQUEST_URL}/filter/query?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to filter requests');
    }
    return response.json();
  },

  getMessages: async (requestId) => {
    const response = await fetch(`${API_REQUEST_URL}/${requestId}/messages`);
    if (!response.ok) {
      throw new Error(`Failed to fetch messages for request ${requestId}`);
    }
    return response.json();
  },

  addMessage: async (requestId, messageData) => {
    const response = await fetch(`${API_REQUEST_URL}/${requestId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) {
      throw new Error(`Failed to add message to request ${requestId}`);
    }
    return response.json();
  },

  updateMessages: async (requestId, messages) => {
    const response = await fetch(`${API_REQUEST_URL}/${requestId}/messages`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update messages for request ${requestId}`);
    }
    return response.json();
  },

  updateMessage: async (requestId, messageIndex, messageData) => {
    const response = await fetch(`${API_REQUEST_URL}/${requestId}/messages/${messageIndex}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update message ${messageIndex} in request ${requestId}`);
    }
    return response.json();
  },

  deleteMessage: async (requestId, messageIndex) => {
    const response = await fetch(`${API_REQUEST_URL}/${requestId}/messages/${messageIndex}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete message ${messageIndex} from request ${requestId}`);
    }
    return response.json();
  },
};