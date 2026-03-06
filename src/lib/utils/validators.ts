// Validate phone number (Indian format)
export const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
    const cleaned = phone.replace(/\D/g, '');

    // Check for Indian mobile number (10 digits, starts with 6-9)
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
        return { valid: true };
    }

    // Check for number with country code
    if (cleaned.length === 12 && cleaned.startsWith('91') && /^91[6-9]/.test(cleaned)) {
        return { valid: true };
    }

    return { valid: false, error: 'Please enter a valid 10-digit Indian mobile number' };
};

// Validate budget
export const validateBudget = (
    min: number,
    max: number
): { valid: boolean; error?: string } => {
    if (min < 0 || max < 0) {
        return { valid: false, error: 'Budget cannot be negative' };
    }

    if (min > max) {
        return { valid: false, error: 'Minimum budget cannot be greater than maximum' };
    }

    if (max > 1000000) {
        return { valid: false, error: 'Maximum budget cannot exceed ₹10,00,000' };
    }

    return { valid: true };
};

// Validate demand title
export const validateTitle = (title: string): { valid: boolean; error?: string } => {
    if (!title.trim()) {
        return { valid: false, error: 'Title is required' };
    }

    if (title.length < 5) {
        return { valid: false, error: 'Title must be at least 5 characters' };
    }

    if (title.length > 100) {
        return { valid: false, error: 'Title must be less than 100 characters' };
    }

    return { valid: true };
};

// Validate description
export const validateDescription = (description: string): { valid: boolean; error?: string } => {
    if (!description.trim()) {
        return { valid: false, error: 'Description is required' };
    }

    if (description.length < 20) {
        return { valid: false, error: 'Description must be at least 20 characters' };
    }

    if (description.length > 500) {
        return { valid: false, error: 'Description must be less than 500 characters' };
    }

    return { valid: true };
};

// Validate offer price
export const validateOfferPrice = (
    price: number,
    budgetMax?: number
): { valid: boolean; error?: string } => {
    if (price <= 0) {
        return { valid: false, error: 'Offer price must be greater than 0' };
    }

    if (price > 1000000) {
        return { valid: false, error: 'Offer price cannot exceed ₹10,00,000' };
    }

    return { valid: true };
};

// Sanitize input (prevent XSS)
export const sanitizeInput = (input: string): string => {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};
