'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Filter, ToggleLeft, ToggleRight, TrendingUp, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToActiveDemands, Demand, getSellerBids, Bid } from '@/lib/firebase/firestore';
import { DemandCard } from '@/components/demands';
import { Button, Badge, Card } from '@/components/ui';

const marketAreas = [
    'All Areas',
    'Busyland',
    'Rajapeth',
    'Camp Area',
    'Badnera',
    'Morshi Road',
];

export default function SellerDashboard() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    const [demands, setDemands] = useState<Demand[]>([]);
    const [filteredDemands, setFilteredDemands] = useState<Demand[]>([]);
    const [myBids, setMyBids] = useState<Bid[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [localModeEnabled, setLocalModeEnabled] = useState(false);
    const [selectedArea, setSelectedArea] = useState('All Areas');
    const [activeTab, setActiveTab] = useState<'demands' | 'mybids'>('demands');

    // Auth check
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (!loading && userProfile && userProfile.role !== 'seller' && userProfile.role !== 'both') {
            router.push('/profile?upgrade=seller');
        }
    }, [user, userProfile, loading, router]);

    // Fetch demands
    useEffect(() => {
        const unsubscribe = subscribeToActiveDemands((demandsData) => {
            setDemands(demandsData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Fetch seller's bids
    useEffect(() => {
        const fetchMyBids = async () => {
            if (!user) return;
            try {
                const bids = await getSellerBids(user.uid);
                setMyBids(bids);
            } catch (error) {
                console.error('Error fetching bids:', error);
            }
        };

        if (user) {
            fetchMyBids();
        }
    }, [user]);

    // Filter demands based on local mode and area
    useEffect(() => {
        let filtered = demands.filter((d) => {
            const expiresAt = d.expiresAt.toDate();
            return expiresAt > new Date() && d.status === 'active';
        });

        // Filter by market area
        if (selectedArea !== 'All Areas') {
            filtered = filtered.filter((d) =>
                d.targetMarketArea?.toLowerCase().includes(selectedArea.toLowerCase()) ||
                d.location?.address?.toLowerCase().includes(selectedArea.toLowerCase())
            );
        }

        // Filter by distance (mock - in production would use actual geolocation)
        if (localModeEnabled && userProfile?.location) {
            // For now, just show all - in production this would calculate actual distance
            filtered = filtered.filter((d) => {
                if (!d.location) return true;
                // Mock: assume all are within 5km for demo
                return true;
            });
        }

        setFilteredDemands(filtered);
    }, [demands, localModeEnabled, selectedArea, userProfile]);

    // Stats calculation
    const stats = {
        activeDemands: filteredDemands.length,
        totalBids: myBids.length,
        acceptedBids: myBids.filter((b) => b.status === 'accepted').length,
        pendingBids: myBids.filter((b) => b.status === 'pending').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="py-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Seller Dashboard</h1>
                    <p className="text-gray-500">
                        Welcome back, {userProfile?.name || 'Seller'}! View customer demands and submit bids.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div
                        className="p-6 rounded-2xl shadow-sm text-white"
                        style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E64A19 100%)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.activeDemands}</p>
                                <p className="text-sm text-white/80">Active Demands</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalBids}</p>
                                <p className="text-sm text-gray-500">Total Bids</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.acceptedBids}</p>
                                <p className="text-sm text-gray-500">Accepted</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-xl">
                                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingBids}</p>
                                <p className="text-sm text-gray-500">Pending</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Local Mode Toggle */}
                        <button
                            onClick={() => setLocalModeEnabled(!localModeEnabled)}
                            className="flex items-center gap-3 group"
                        >
                            {localModeEnabled ? (
                                <ToggleRight className="w-10 h-6 text-orange-500 transition-colors" />
                            ) : (
                                <ToggleLeft className="w-10 h-6 text-gray-400 group-hover:text-gray-500 transition-colors" />
                            )}
                            <div className="text-left">
                                <p className="font-medium text-gray-900">My Area Only</p>
                                <p className="text-sm text-gray-500">Show demands within 5km radius</p>
                            </div>
                        </button>

                        {/* Area Filter */}
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <select
                                value={selectedArea}
                                onChange={(e) => setSelectedArea(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer hover:border-orange-300 transition-colors"
                            >
                                {marketAreas.map((area) => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('demands')}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${activeTab === 'demands'
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        Active Demands
                    </button>
                    <button
                        onClick={() => setActiveTab('mybids')}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${activeTab === 'mybids'
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        My Bids
                        {stats.pendingBids > 0 && (
                            <Badge variant="warning" className="ml-2 bg-amber-100 text-amber-700 border-none">{stats.pendingBids}</Badge>
                        )}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'demands' ? (
                    <>
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                                        <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4" />
                                            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredDemands.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredDemands.map((demand) => (
                                    <DemandCard key={demand.id} demand={demand} showBidButton />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 shadow-sm">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No demands found</h3>
                                <p className="text-gray-500">
                                    {localModeEnabled || selectedArea !== 'All Areas'
                                        ? 'Try adjusting your filters to see more demands.'
                                        : 'Check back later for new customer demands.'}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {myBids.length > 0 ? (
                            <div className="space-y-4">
                                {myBids.map((bid) => (
                                    <div key={bid.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                        <img
                                            src={bid.imageURL}
                                            alt="Bid item"
                                            className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                Demand #{bid.demandId.slice(-6)}
                                            </p>
                                            <p className="text-lg font-bold text-orange-500">
                                                ₹{bid.offerPrice.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                bid.status === 'accepted' ? 'success' :
                                                    bid.status === 'rejected' ? 'error' : 'warning'
                                            }
                                            className={
                                                bid.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                    bid.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                            }
                                        >
                                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 shadow-sm">
                                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No bids yet</h3>
                                <p className="text-gray-500 mb-6">
                                    Start bidding on customer demands to grow your business!
                                </p>
                                <Button onClick={() => setActiveTab('demands')}>
                                    View Demands
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
