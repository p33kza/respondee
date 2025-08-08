/**
 * Format date function that handles Firebase timestamps and other date formats
 * @param {Object|Date|string|number} dateInput - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput) => {
    if (!dateInput) {
        return 'No date';
    }

    let date;

    try {
        if (dateInput && typeof dateInput === 'object' && dateInput._seconds) {
        const milliseconds = dateInput._seconds * 1000 + Math.floor(dateInput._nanoseconds / 1000000);
        date = new Date(milliseconds);
        }
        else if (dateInput && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
        }
        else if (dateInput instanceof Date) {
        date = dateInput;
        }
        else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
        }
        else if (typeof dateInput === 'object' && dateInput.date) {
        return formatDate(dateInput.date);
        }
        else {
        date = new Date(dateInput);
        }

        if (isNaN(date.getTime())) {
        return 'Invalid date';
        }

        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 1) {
        return 'Just now';
        } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
        } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
        } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
        }

        const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        };

        return date.toLocaleDateString('en-US', options);

    } catch (error) {
        console.error('Error formatting date:', error, dateInput);
        return 'Invalid date';
    }
    };

    /**
     * Format date to a specific format (alternative version)
     * @param {Object|Date|string|number} dateInput - The date to format
     * @param {string} format - Format type: 'relative', 'short', 'long', 'time'
     * @returns {string} Formatted date string
     */
    export const formatDateCustom = (dateInput, format = 'long') => {
    if (!dateInput) {
        return 'No date';
    }

    let date;

    try {
        if (dateInput && typeof dateInput === 'object' && dateInput._seconds) {
        const milliseconds = dateInput._seconds * 1000 + Math.floor(dateInput._nanoseconds / 1000000);
        date = new Date(milliseconds);
        }
        else if (dateInput && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
        }
        else {
        date = new Date(dateInput);
        }

        if (isNaN(date.getTime())) {
        return 'Invalid date';
        }

        switch (format) {
        case 'relative':
            return getRelativeTime(date);
        case 'short':
            return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
            });
        case 'long':
            return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
            });
        case 'time':
            return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
            });
        case 'datetime':
            return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
            });
        default:
            return getRelativeTime(date);
        }

    } catch (error) {
        console.error('Error formatting date:', error, dateInput);
        return 'Invalid date';
    }
    };

    /**
     * Helper function to get relative time
     * @param {Date} date - Date object
     * @returns {string} Relative time string
     */
    const getRelativeTime = (date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    } else if (diffInWeeks < 4) {
        return `${diffInWeeks}w ago`;
    } else if (diffInMonths < 12) {
        return `${diffInMonths}mo ago`;
    } else {
        return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
        });
    }
};

export const getTimestampFromFirebaseDate = (firebaseDate) => {
    if (!firebaseDate) return 0;
    
    if (firebaseDate instanceof Date) {
      return firebaseDate.getTime();
    }
    
    if (firebaseDate._seconds !== undefined) {
      return new Date(firebaseDate._seconds * 1000).getTime();
    }
    
    if (firebaseDate.seconds) {
      return new Date(firebaseDate.seconds * 1000).getTime();
    }
    
    if (typeof firebaseDate === 'string') {
      return new Date(firebaseDate).getTime();
    }
    
    return new Date(firebaseDate).getTime();
  };