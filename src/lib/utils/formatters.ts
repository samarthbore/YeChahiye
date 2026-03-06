import { format, formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

// Format currency in Indian Rupees
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

// Format budget range
export const formatBudgetRange = (min: number, max: number): string => {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

// Format date
export const formatDate = (timestamp: Timestamp | Date): string => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'dd MMM yyyy');
};

// Format time ago
export const formatTimeAgo = (timestamp: Timestamp | Date): string => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
};

// Calculate time remaining
export const getTimeRemaining = (expiresAt: Timestamp | Date): {
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    totalSeconds: number;
} => {
    const expireDate = expiresAt instanceof Timestamp ? expiresAt.toDate() : expiresAt;
    const now = new Date();
    const totalSeconds = differenceInSeconds(expireDate, now);

    if (totalSeconds <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, isExpired: true, totalSeconds: 0 };
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, isExpired: false, totalSeconds };
};

// Format countdown
export const formatCountdown = (hours: number, minutes: number, seconds: number): string => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
    // Remove country code if present
    const cleaned = phone.replace(/^\+91/, '').replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
};
