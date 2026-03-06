import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

// Google Sign In
export const signInWithGoogle = async (): Promise<User> => {
    if (!auth) {
        throw new Error('Firebase Auth not initialized. Please configure Firebase credentials.');
    }
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

// Phone Authentication
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
    if (!auth) {
        throw new Error('Firebase Auth not initialized. Please configure Firebase credentials.');
    }
    return new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
            // reCAPTCHA solved
        },
    });
};

export const sendOTP = async (
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
    if (!auth) {
        throw new Error('Firebase Auth not initialized. Please configure Firebase credentials.');
    }
    try {
        const confirmationResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            recaptchaVerifier
        );
        return confirmationResult;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
};

export const verifyOTP = async (
    confirmationResult: ConfirmationResult,
    otp: string
): Promise<User> => {
    try {
        const result = await confirmationResult.confirm(otp);
        return result.user;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

// Sign Out
export const signOut = async (): Promise<void> => {
    if (!auth) {
        throw new Error('Firebase Auth not initialized. Please configure Firebase credentials.');
    }
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

// Auth State Observer
export const onAuthChange = (callback: (user: User | null) => void) => {
    if (!auth) {
        // Return a no-op unsubscribe function when auth is not initialized
        callback(null);
        return () => { };
    }
    return onAuthStateChanged(auth, callback);
};
