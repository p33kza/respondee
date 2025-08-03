import { API_BASE_URL } from "./api";

const INVENTORY_API_URL = API_BASE_URL + '/api';

export const checkAvailabilityAPI = async (items) => {
  const res = await fetch(`${INVENTORY_API_URL}/inventory/check-availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });

  if (!res.ok) throw new Error('Failed to check availability');
  return res.json();
};

export const approveRequestAPI = async ({ requestId, handlerId }) => {
  const res = await fetch(`${INVENTORY_API_URL}/requests/${requestId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handlerId })
  });

  if (!res.ok) throw new Error('Failed to approve request');
  return res.json();
};

export const returnItemsAPI = async ({ requestId, returns }) => {
  const res = await fetch(`${INVENTORY_API_URL}/requests/${requestId}/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returns })
  });

  if (!res.ok) throw new Error('Failed to return items');
  return res.json();
};

export const createInventoryItemAPI = async (itemData) => {
  const res = await fetch(`${INVENTORY_API_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });

  if (!res.ok) throw new Error('Failed to create inventory item');
  return res.json();
};

export const fetchInventoryItemsAPI = async () => {
  const res = await fetch(`${INVENTORY_API_URL}/inventory`);
  
  if (!res.ok) throw new Error('Failed to fetch inventory items');
  return res.json();
};

export const fetchInventoryItemAPI = async (itemName) => {
  const res = await fetch(`${INVENTORY_API_URL}/inventory/${itemName}`);
  
  if (!res.ok) throw new Error('Failed to fetch inventory item');
  return res.json();
};

export const updateInventoryItemAPI = async ({ itemName, updateData }) => {
  const res = await fetch(`${INVENTORY_API_URL}/inventory/${itemName}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });

  if (!res.ok) throw new Error('Failed to update inventory item');
  return res.json();
};

export const deleteInventoryItemAPI = async (itemName) => {
  const res = await fetch(`${INVENTORY_API_URL}/inventory/${itemName}`, {
    method: 'DELETE'
  });

  if (!res.ok) throw new Error('Failed to delete inventory item');
  return res.json();
};

export const cancelRequest = async (requestId) => {
  try {
    const response = await fetch(`${INVENTORY_API_URL}/requests/${requestId}/cancel`, {
      method: 'POST',
    });

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
};