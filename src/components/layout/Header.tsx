'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, ShoppingBag, Store } from 'lucide-react';
import Button from '@/components/ui/Button';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
    const { user, userProfile, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const isSeller = userProfile?.role === 'seller' || userProfile?.role === 'both';

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100" style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #f3f4f6' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
                <div className="flex items-center justify-between h-16" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                background: 'linear-gradient(135deg, #FF6B35 0%, #E64A19 100%)',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <span className="text-white text-xl font-bold" style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>ये</span>
                        </div>
                        <span
                            className="text-xl font-bold"
                            style={{
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                background: 'linear-gradient(to right, #FF5722, #7B1FA2)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            YeChahiye
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Link
                            href="/demands"
                            className="text-gray-700 hover:text-orange-600 font-bold px-5 py-2.5 rounded-full hover:bg-orange-50 transition-all hover:scale-105 active:scale-95"
                            style={{
                                fontWeight: '700',
                                color: '#374151',
                                padding: '0.625rem 1.25rem',
                                borderRadius: '9999px',
                                transition: 'all 0.2s',
                                backgroundColor: 'transparent',
                                border: '1px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFF7ED';
                                e.currentTarget.style.color = '#EA580C';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#374151';
                            }}
                        >
                            Browse Demands
                        </Link>
                        {isSeller && (
                            <Link
                                href="/seller/dashboard"
                                className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
                            >
                                Seller Dashboard
                            </Link>
                        )}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {user ? (
                            <>
                                <Link href="/demands/new" className="hidden sm:block">
                                    <button
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/30 hover:scale-105 active:scale-95"
                                        style={{
                                            backgroundColor: '#FF6B35',
                                            color: 'white',
                                            padding: '0.625rem 1.25rem',
                                            borderRadius: '9999px',
                                            fontWeight: '700',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        Post Demand
                                    </button>
                                </Link>

                                {/* Notification Bell */}
                                <NotificationBell />

                                {/* Profile Menu */}
                                <div className="relative" style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        {userProfile?.photoURL ? (
                                            <img
                                                src={userProfile.photoURL}
                                                alt={userProfile.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                                style={{ width: '2rem', height: '2rem', borderRadius: '9999px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div
                                                className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"
                                                style={{ width: '2rem', height: '2rem', borderRadius: '9999px', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <User className="w-4 h-4 text-orange-600" />
                                            </div>
                                        )}
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {userProfile?.name || 'User'}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {userProfile?.email || userProfile?.phone}
                                                </p>
                                            </div>

                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                Profile
                                            </Link>

                                            {isSeller && (
                                                <Link
                                                    href="/seller/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 md:hidden"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <Store className="w-4 h-4" />
                                                    Seller Dashboard
                                                </Link>
                                            )}

                                            <button
                                                onClick={() => {
                                                    signOut();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-gray-50 w-full"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link href="/login">
                                <button
                                    className="px-6 py-2 rounded-full font-medium transition-all hover:shadow-md active:scale-95"
                                    style={{
                                        backgroundColor: '#FF6B35',
                                        color: 'white',
                                        padding: '0.5rem 1.5rem',
                                        borderRadius: '9999px',
                                        fontWeight: '600',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Login
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
