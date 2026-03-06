import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import { storage } from './config';

// Helper to check if Firebase is configured
const checkStorage = () => {
    if (!storage) {
        throw new Error('Firebase Storage not initialized. Please configure Firebase credentials.');
    }
    return storage;
};

// Generate unique file name
const generateFileName = (originalName: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
};

// Upload demand image
export const uploadDemandImage = async (
    file: File,
    demandId: string
): Promise<string> => {
    const fileName = generateFileName(file.name);
    const storageRef = ref(checkStorage(), `demands/${demandId}/${fileName}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
};

// Upload bid image
export const uploadBidImage = async (
    file: File,
    bidId: string
): Promise<string> => {
    const fileName = generateFileName(file.name);
    const storageRef = ref(checkStorage(), `bids/${bidId}/${fileName}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
};

// Upload user profile image
export const uploadProfileImage = async (
    file: File,
    userId: string
): Promise<string> => {
    const fileName = generateFileName(file.name);
    const storageRef = ref(checkStorage(), `profiles/${userId}/${fileName}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
};

// Delete image
export const deleteImage = async (imageURL: string): Promise<void> => {
    try {
        const storageRef = ref(checkStorage(), imageURL);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'Image size must be less than 5MB' };
    }

    return { valid: true };
};
