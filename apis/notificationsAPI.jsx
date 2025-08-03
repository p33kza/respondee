import { API_BASE_URL } from "./api";

const NOTIFICATION_API_URL = API_BASE_URL + '/api/notifications'; 

export const fetchAllNotifications = async () => {
  const response = await fetch(NOTIFICATION_API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
};

export const fetchNotificationById = async (id) => {
  const response = await fetch(`${NOTIFICATION_API_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Notification not found');
  }
  return response.json();
};

export const createNotification = async (notificationData) => {
  const response = await fetch(NOTIFICATION_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notificationData),
  });
  if (!response.ok) {
    throw new Error('Failed to create notification');
  }
  return response.json();
};

export const updateNotification = async ({ id, ...updateData }) => {
  const response = await fetch(`${NOTIFICATION_API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    throw new Error('Failed to update notification');
  }
  return response.json();
};

export const deleteNotification = async (id) => {
  const response = await fetch(`${NOTIFICATION_API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }
  return { id };
};

export const fetchNotificationsByUserId = async (userId) => {
  const response = await fetch(`${NOTIFICATION_API_URL}/user/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user notifications');
  }
  return response.json();
};

export const fetchNotificationsByRequestId = async (requestId) => {
  const response = await fetch(`${NOTIFICATION_API_URL}/request/${requestId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch request notifications');
  }
  return response.json();
};

export const fetchNotificationsByStatus = async (isRead) => {
  const response = await fetch(`${NOTIFICATION_API_URL}/status/${isRead}`);
  if (!response.ok) {
    throw new Error('Failed to fetch notifications by status');
  }
  return response.json();
};

export const fetchUnreadNotifications = async (userId) => {
  const response = await fetch(`${NOTIFICATION_API_URL}/user/${userId}/unread`);
  if (!response.ok) {
    throw new Error('Failed to fetch unread notifications');
  }
  return response.json();
};

export const markNotificationAsRead = async (id) => {
  const response = await fetch(`${NOTIFICATION_API_URL}/${id}/read`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
  return response.json();
};

export const markAllNotificationsAsRead = async (userId) => {
  const response = await fetch(`${NOTIFICATION_API_URL}/user/${userId}/read-all`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
  return response.json();
};

export const clearAllReadNotifications = async (userId) => {
  const response = await fetch(`${NOTIFICATION_API_URL}/user/${userId}/clear-read`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to clear read notifications');
  }
  return response.json();
};
