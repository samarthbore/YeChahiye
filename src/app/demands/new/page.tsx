'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DemandForm } from '@/components/demands';

export default function NewDemandPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50/50" style={{ backgroundColor: '#F9FAFB' }}>
            <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontSize: '1.875rem', fontWeight: '800', letterSpacing: '-0.025em', color: '#111827' }}>
                        Post a Demand
                    </h1>
                    <p className="text-gray-500 text-lg" style={{ fontSize: '1.125rem', color: '#6B7280' }}>
                        Tell local sellers what you need & get offers
                    </p>
                </div>

                {/* Form Card */}
                <div
                    className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 border border-gray-100"
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                        border: '1px solid #F3F4F6'
                    }}
                >
                    {/* Back Button inside card for cleaner look */}
                    <div className="mb-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Feed
                        </button>
                    </div>

                    <DemandForm />
                </div>
            </div>
        </div>
    );
}
