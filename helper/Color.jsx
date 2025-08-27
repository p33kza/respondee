export const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending': return '#ff9800';
        case 'in progress': return '#2196f3';
        case 'done': return '#4caf50';
        default: return '#757575';
    }
};

export const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
        case 'low': return '#4caf50';
        case 'medium': return '#ff9800';
        case 'high': return '#f44336';
        default: return '#757575';
    }
};

export const getLabelColor = (labelAs) => {
    switch (labelAs?.toLowerCase()) {
        case 'fraud': return '#dc2626';
        case 'threat': return '#7c2d12';
        case 'accident': return '#ea580c';
        default: return '#6b7280';
    }
};
