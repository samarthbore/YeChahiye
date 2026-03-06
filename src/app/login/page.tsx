'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { signInWithGoogle, user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            toast.success('Welcome to YeChahiye!');
            router.push('/');
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                toast.error('Login cancelled');
            } else if (error.message && error.message.includes('Firebase Auth not initialized')) {
                toast.error('Configuration Error: Missing Firebase Credentials. Please check .env.local');
            } else {
                toast.error('Failed to login. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50" style={{ backgroundColor: '#F9FAFB' }}>
            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity" style={{ textDecoration: 'none' }}>
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20"
                            style={{
                                width: '3rem',
                                height: '3rem',
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
                            className="text-2xl font-bold tracking-tight"
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                background: 'linear-gradient(to right, #FF5722, #7B1FA2)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            YeChahiye
                        </span>
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontSize: '1.875rem', fontWeight: '800', color: '#111827', marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>
                        Welcome Back!
                    </h1>
                    <p className="text-gray-500 text-lg" style={{ color: '#6B7280', fontSize: '1.125rem' }}>
                        Login to continue finding what you need
                    </p>
                </div>

                {/* Login Card */}
                <div
                    className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #F3F4F6'
                    }}
                >
                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98]"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '0.75rem',
                            border: '2px solid #E5E7EB',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#374151',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-8" style={{ margin: '2rem 0', position: 'relative' }}>
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100" style={{ width: '100%', borderTop: '1px solid #E5E7EB' }} />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400 font-medium" style={{ padding: '0 1rem', backgroundColor: 'white', color: '#9CA3AF' }}>or continue with</span>
                        </div>
                    </div>

                    {/* Phone Login Info */}
                    <div
                        className="text-center p-6 bg-orange-50/50 rounded-2xl border border-orange-100"
                        style={{ padding: '1.5rem', backgroundColor: '#FFF7ED', borderRadius: '1rem', border: '1px solid #FFEDD5' }}
                    >
                        <p className="text-base font-medium text-gray-800 mb-1" style={{ fontSize: '1rem', fontWeight: '500', color: '#1F2937', marginBottom: '0.25rem' }}>
                            📱 Phone login coming soon!
                        </p>
                        <p className="text-sm text-gray-500" style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                            We're protecting your digits with top-notch security. OTP login will be available shortly.
                        </p>
                    </div>
                </div>

                {/* Terms */}
                <p className="text-center text-sm text-gray-400 mt-8" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#9CA3AF' }}>
                    By continuing, you agree to our<br />
                    <Link href="/terms" className="text-gray-600 hover:text-orange-600 font-medium transition-colors" style={{ color: '#4B5563', fontWeight: '500', margin: '0 0.25rem' }}>
                        Terms of Service
                    </Link>
                    and
                    <Link href="/privacy" className="text-gray-600 hover:text-orange-600 font-medium transition-colors" style={{ color: '#4B5563', fontWeight: '500', margin: '0 0.25rem' }}>
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    );
}
