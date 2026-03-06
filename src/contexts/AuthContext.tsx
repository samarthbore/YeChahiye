'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOut } from '@/lib/firebase/auth';
import { getUserProfile, createUserProfile, UserProfile } from '@/lib/firebase/firestore';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (userId: string) => {
        const profile = await getUserProfile(userId);
        setUserProfile(profile);
        return profile;
    };

    const refreshUserProfile = async () => {
        if (user) {
            await fetchUserProfile(user.uid);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            try {
                setUser(firebaseUser);

                if (firebaseUser) {
                    await fetchUserProfile(firebaseUser.uid);
                } else {
                    setUserProfile(null);
                }
            } catch (error) {
                console.error('Error in auth state change:', error);
                setUserProfile(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSignInWithGoogle = async () => {
        try {
            const user = await signInWithGoogle();
            const existingProfile = await getUserProfile(user.uid);

            if (!existingProfile) {
                // Create initial profile for new users
                await createUserProfile(user.uid, {
                    name: user.displayName || '',
                    phone: user.phoneNumber || '',
                    email: user.email,
                    role: 'buyer', // Default role, can be changed in onboarding
                    photoURL: user.photoURL,
                    shopName: null,
                    shopAddress: null,
                    marketArea: null,
                    location: null,
                });
            }

            await fetchUserProfile(user.uid);
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            setUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        userProfile,
        loading,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        refreshUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
