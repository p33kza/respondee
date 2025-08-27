import { API_BASE_URL } from './api';

const AUTH_API_URL = `${API_BASE_URL}/auth`;

export const registerUser = async (userData) => {
  const response = await fetch(`${AUTH_API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Registration failed');
  }
  
  return response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Login failed');
  }
  
  return response.json();
};

export const updateUser = async (uid, userData) => {
  const response = await fetch(`${AUTH_API_URL}/update-user/${uid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Update failed');
  }
  
  return response.json();
};

export const deleteUser = async (uid) => {
  const response = await fetch(`${AUTH_API_URL}/delete-user/${uid}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Deletion failed');
  }
  
  return response.json();
};

export const sendVerificationCode = async (emailData) => {
  const response = await fetch(`${AUTH_API_URL}/send-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to send verification code');
  }
  
  return response.json();
};

export const verifyCode = async (verificationData) => {
  const response = await fetch(`${AUTH_API_URL}/verify-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verificationData),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Verification failed');
  }
  
  return response.json();
};