'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Clock, MessageSquare, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserDemands, Demand } from '@/lib/firebase/firestore';
import { formatBudgetRange, formatTimeAgo } from '@/lib/utils/formatters';
import { Button, Badge, Countdown } from '@/components/ui';
import Link from 'next/link';

const statusConfig = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: Clock },
    matched: { label: 'Matched', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-600', icon: XCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

type StatusFilter = 'all' | 'active' | 'matched' | 'expired';

function MyDemandsContent() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [demands, setDemands] = useState<Demand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToUserDemands(user.uid, (userDemands) => {
            setDemands(userDemands);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filteredDemands = demands.filter((demand) => {
        if (statusFilter === 'all') return true;
        return demand.status === statusFilter;
    });

    const statusCounts = {
        all: demands.length,
        active: demands.filter((d) => d.status === 'active').length,
        matched: demands.filter((d) => d.status === 'matched').length,
        expired: demands.filter((d) => d.status === 'expired' || d.status === 'cancelled').length,
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Demands</h1>
                            <p className="text-gray-500 mt-1">Track your requests and incoming bids</p>
                        </div>
                        <Button onClick={() => router.push('/demands/new')} leftIcon={<Plus className="w-4 h-4" />}>
                            New Demand
                        </Button>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {(['all', 'active', 'matched', 'expired'] as StatusFilter[]).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`
                                    px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                    ${statusFilter === status
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Demands List */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {filteredDemands.length > 0 ? (
                    <div className="space-y-4">
                        {filteredDemands.map((demand) => {
                            const StatusIcon = statusConfig[demand.status]?.icon || Clock;
                            return (
                                <Link href={`/demands/${demand.id}`} key={demand.id}>
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="flex">
                                            {/* Image */}
                                            <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                                                <img
                                                    src={demand.imageURL}
                                                    alt={demand.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-4 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                                                            {demand.title}
                                                        </h3>
                                                        <Badge
                                                            className={`${statusConfig[demand.status]?.color} text-xs flex-shrink-0`}
                                                        >
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {statusConfig[demand.status]?.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-orange-600 font-bold text-lg">
                                                        {formatBudgetRange(demand.budget.min, demand.budget.max)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="w-4 h-4" />
                                                            {demand.bidCount || 0} bids
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {formatTimeAgo(demand.createdAt)}
                                                        </span>
                                                    </div>
                                                    {demand.status === 'active' && (
                                                        <Countdown expiresAt={demand.expiresAt} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <div className="w-20 h-20 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-10 h-10 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {statusFilter === 'all' ? 'No demands yet' : `No ${statusFilter} demands`}
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            {statusFilter === 'all'
                                ? "Post your first demand and let local sellers find what you're looking for!"
                                : `You don't have any ${statusFilter} demands at the moment.`}
                        </p>
                        {statusFilter === 'all' && (
                            <Button onClick={() => router.push('/demands/new')}>
                                Post Your First Demand
                            </Button>
                        )}
                    </div>
                )}
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

export default function MyDemandsPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <MyDemandsContent />
        </Suspense>
    );
}
