'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Store, MapPin, Phone, Mail, Camera, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/firebase/firestore';
import { Button, Card, Input } from '@/components/ui';
import toast from 'react-hot-toast';

const marketAreas = [
    'Busyland',
    'Rajapeth',
    'Camp Area',
    'Badnera',
    'Morshi Road',
    'Other',
];

function ProfileContent() {
    const { user, userProfile, loading, signOut, refreshUserProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const upgradeToSeller = searchParams.get('upgrade') === 'seller';

    const [isEditing, setIsEditing] = useState(upgradeToSeller);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: userProfile?.name || '',
        phone: userProfile?.phone || '',
        role: userProfile?.role || 'buyer',
        shopName: userProfile?.shopName || '',
        shopAddress: userProfile?.shopAddress || '',
        marketArea: userProfile?.marketArea || '',
    });

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    React.useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                phone: userProfile.phone || '',
                role: userProfile.role || 'buyer',
                shopName: userProfile.shopName || '',
                shopAddress: userProfile.shopAddress || '',
                marketArea: userProfile.marketArea || '',
            });
        }
    }, [userProfile]);

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            await updateUserProfile(user.uid, {
                name: formData.name,
                phone: formData.phone,
                role: formData.role as 'buyer' | 'seller' | 'both',
                shopName: formData.role !== 'buyer' ? formData.shopName : null,
                shopAddress: formData.role !== 'buyer' ? formData.shopAddress : null,
                marketArea: formData.role !== 'buyer' ? formData.marketArea : null,
            });

            await refreshUserProfile();
            setIsEditing(false);
            toast.success('Profile updated successfully!');

            if (upgradeToSeller) {
                router.push('/seller/dashboard');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const isSeller = formData.role === 'seller' || formData.role === 'both';

    return (
        <div className="py-8 bg-gray-50 min-h-screen">
            <div className="max-w-xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    {/* Profile Picture */}
                    <div className="relative inline-block mb-4">
                        {userProfile?.photoURL ? (
                            <img
                                src={userProfile.photoURL}
                                alt={userProfile.name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div
                                className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E64A19 100%)' }}
                            >
                                <User className="w-12 h-12 text-white" />
                            </div>
                        )}
                        <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                            <Camera className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">
                        {userProfile?.name || 'User'}
                    </h1>
                    <p className="text-gray-500">
                        {userProfile?.email || userProfile?.phone}
                    </p>
                </div>

                {/* Upgrade Banner */}
                {upgradeToSeller && (
                    <div
                        className="mb-6 p-4 rounded-2xl shadow-sm text-white flex items-center gap-3"
                        style={{ background: 'linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)' }}
                    >
                        <Store className="w-8 h-8" />
                        <div>
                            <h3 className="font-semibold">Become a Seller</h3>
                            <p className="text-sm text-white/80">
                                Fill in your shop details to start receiving customer demands
                            </p>
                        </div>
                    </div>
                )}

                {/* Profile Form */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>
                        {!isEditing && (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                                Edit
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Name */}
                        <Input
                            label="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={!isEditing}
                            leftIcon={<User className="w-5 h-5 text-gray-400" />}
                        />

                        {/* Phone */}
                        <Input
                            label="Phone Number"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={!isEditing}
                            leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                            placeholder="+91 XXXXX XXXXX"
                        />

                        {/* Email (read-only) */}
                        <Input
                            label="Email"
                            type="email"
                            value={userProfile?.email || ''}
                            disabled
                            leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                        />

                        {/* Role Selection */}
                        {isEditing && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    I want to
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {([
                                        { value: 'buyer' as const, label: 'Buy', icon: '🛒' },
                                        { value: 'seller' as const, label: 'Sell', icon: '🏪' },
                                        { value: 'both' as const, label: 'Both', icon: '🤝' },
                                    ]).map((role) => (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: role.value })}
                                            className={`
                        p-3 rounded-xl border-2 transition-all text-center
                        ${formData.role === role.value
                                                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }
                      `}
                                        >
                                            <span className="text-2xl block mb-1">{role.icon}</span>
                                            <span className="font-medium">{role.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Seller Details */}
                {isSeller && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Store className="w-5 h-5 text-purple-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Shop Details</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Shop Name */}
                            <Input
                                label="Shop Name"
                                value={formData.shopName}
                                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                disabled={!isEditing}
                                placeholder="Your shop name"
                            />

                            {/* Shop Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Shop Address
                                </label>
                                <textarea
                                    value={formData.shopAddress}
                                    onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="Full shop address"
                                    rows={2}
                                    className={`
                    w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400
                    bg-white border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    transition-all
                  `}
                                />
                            </div>

                            {/* Market Area */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Market Area
                                </label>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <select
                                        value={formData.marketArea}
                                        onChange={(e) => setFormData({ ...formData, marketArea: e.target.value })}
                                        disabled={!isEditing}
                                        className={`
                      flex-1 h-12 px-4 bg-white border border-gray-200 rounded-xl
                      text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400
                      disabled:bg-gray-100 disabled:cursor-not-allowed
                    `}
                                    >
                                        <option value="">Select your market area</option>
                                        {marketAreas.map((area) => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {isEditing && (
                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => {
                                setIsEditing(false);
                                // Reset form
                                if (userProfile) {
                                    setFormData({
                                        name: userProfile.name || '',
                                        phone: userProfile.phone || '',
                                        role: userProfile.role || 'buyer',
                                        shopName: userProfile.shopName || '',
                                        shopAddress: userProfile.shopAddress || '',
                                        marketArea: userProfile.marketArea || '',
                                    });
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            onClick={handleSave}
                            isLoading={isSaving}
                            leftIcon={<Save className="w-4 h-4" />}
                        >
                            Save Changes
                        </Button>
                    </div>
                )}

                {/* Sign Out */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={handleSignOut}
                        className="text-red-500 hover:bg-red-50"
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ProfileContent />
        </Suspense>
    );
}
