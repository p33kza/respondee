import { API_BASE_URL } from "./api";

const USER_API_URL = API_BASE_URL +'/api/users';

export const getUsers = async () => {
    const res = await fetch(`${USER_API_URL}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
};

export const getUserById = async (id) => {
    const res = await fetch(`${USER_API_URL}/${id}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
};

export const createUser = async (userData) => {
    const res = await fetch(`${USER_API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
};

export const updateUser = async ({ id, updates }) => {
    const res = await fetch(`${USER_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
};
export const partialUpdateUser = async ({ id, updates }) => {
    const res = await fetch(`${USER_API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
};
export const deleteUser = async (id) => {
    const res = await fetch(`${USER_API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
};
export const getLogisticsHandlers = async () => {
    const res = await fetch(`${USER_API_URL}/role/logistics-handlers`);
    if (!res.ok) throw new Error('Failed to fetch logistics handlers');
    const data = await res.json();
    return data.filter(user => user.role === 'logisticsHandler');
};
export const getComplaintsHandlers = async () => {
    const res = await fetch(`${USER_API_URL}/role/complaints-handlers`);
    if (!res.ok) throw new Error('Failed to fetch complaints handlers');
    const data = await res.json();
    return data.filter(user => user.role === 'complaintsHandler');
};

export const setUserNotNew = async (id) => {
    const res = await fetch(`${USER_API_URL}/${id}/set-not-new`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to set user not new');
    return res.json();
};