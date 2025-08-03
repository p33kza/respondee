import { API_BASE_URL } from "./api";

const HANDLER_API_URL = API_BASE_URL + '/api/handlers';

export const getAllHandlers = async () => {
    const res = await fetch(`${HANDLER_API_URL}`);
    if (!res.ok) throw new Error('Failed to fetch all handlers');
    return res.json();
};

export const getLogisticsHandlers = async () => {
    const res = await fetch(`${HANDLER_API_URL}/logistics-handlers`);
    if (!res.ok) throw new Error('Failed to fetch logistics handlers');
    return res.json();
};

export const getComplaintsHandlers = async () => {
    const res = await fetch(`${HANDLER_API_URL}/complaints-handlers`);
    if (!res.ok) throw new Error('Failed to fetch complaints handlers');
    return res.json();
};

export const createHandler = async (handlerData) => {
    const res = await fetch(`${HANDLER_API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(handlerData),
    });
    if (!res.ok) throw new Error('Failed to create handler');
    return res.json();
};

export const updateHandler = async ({ id, updates }) => {
    const res = await fetch(`${HANDLER_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update handler');
    return res.json();
};

export const deleteHandler = async (id) => {
    const res = await fetch(`${HANDLER_API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete handler');
    return res.json();
};
