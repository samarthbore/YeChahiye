'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { subscribeToActiveDemands, Demand } from '@/lib/firebase/firestore';
import { DemandCard } from '@/components/demands';
import Button from '@/components/ui/Button';

const categories = [
    { value: 'all', label: 'All', emoji: '🔍' },
    { value: 'clothing', label: 'Clothing', emoji: '👔' },
    { value: 'fashion', label: 'Fashion', emoji: '👗' },
    { value: 'textiles', label: 'Textiles', emoji: '🧵' },
    { value: 'accessories', label: 'Accessories', emoji: '👜' },
];

function DemandsContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');

    const [demands, setDemands] = useState<Demand[]>([]);
    const [filteredDemands, setFilteredDemands] = useState<Demand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToActiveDemands((demands) => {
            setDemands(demands);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let filtered = demands;

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((d) => d.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (d) =>
                    d.title.toLowerCase().includes(query) ||
                    d.description.toLowerCase().includes(query)
            );
        }

        // Filter out expired demands
        filtered = filtered.filter((d) => {
            if (!d.expiresAt) return true;
            const expiresAt = d.expiresAt.toDate();
            return expiresAt > new Date();
        });

        setFilteredDemands(filtered);
    }, [demands, selectedCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#F9FAFB', paddingBottom: '4rem' }}>
            {/* Header Content */}
            <div className="bg-white border-b border-gray-100" style={{ backgroundColor: 'white', borderBottom: '1px solid #F3F4F6' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
                    <div className="max-w-3xl">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>Browse Demands</h1>
                        <p className="text-lg text-gray-500 mb-8" style={{ fontSize: '1.125rem', color: '#6B7280', marginBottom: '2rem' }}>
                            Find what customers are looking for and submit your offers
                        </p>

                        {/* Search Bar */}
                        <div className="relative mb-8" style={{ marginBottom: '2rem', position: 'relative' }}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="text"
                                placeholder="Search demands..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-lg shadow-sm"
                                style={{
                                    width: '100%',
                                    height: '3.5rem',
                                    paddingLeft: '3rem',
                                    paddingRight: '1rem',
                                    borderRadius: '1rem',
                                    backgroundColor: '#F9FAFB',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '1.125rem'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Category Chips */}
                        <div className="flex flex-wrap gap-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`
                                        flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all
                                        ${selectedCategory === cat.value
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 transform scale-105'
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow'
                                        }
                                    `}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.625rem 1.25rem',
                                        borderRadius: '9999px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s',
                                        border: selectedCategory === cat.value ? 'none' : '1px solid #E5E7EB',
                                        backgroundColor: selectedCategory === cat.value ? '#F97316' : 'white',
                                        color: selectedCategory === cat.value ? 'white' : '#4B5563'
                                    }}
                                >
                                    <span className="text-lg">{cat.emoji}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
                <div className="flex items-center justify-between mb-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <p className="font-medium text-gray-500" style={{ color: '#6B7280', fontWeight: '500' }}>
                        Showing {filteredDemands.length} {filteredDemands.length === 1 ? 'result' : 'results'}
                    </p>
                    {(selectedCategory !== 'all' || searchQuery) && (
                        <button
                            onClick={() => {
                                setSelectedCategory('all');
                                setSearchQuery('');
                            }}
                            className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                            style={{ color: '#EA580C', fontWeight: '500', fontSize: '0.875rem' }}
                        >
                            Clear all filters
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                <div className="aspect-[4/3] bg-gray-100 animate-pulse" style={{ aspectRatio: '4/3', backgroundColor: '#F3F4F6' }} />
                                <div className="p-5 space-y-4">
                                    <div className="h-6 bg-gray-100 animate-pulse rounded-lg w-3/4" style={{ height: '1.5rem', width: '75%', backgroundColor: '#F3F4F6' }} />
                                    <div className="h-4 bg-gray-100 animate-pulse rounded-full w-1/2" style={{ height: '1rem', width: '50%', backgroundColor: '#F3F4F6' }} />
                                    <div className="h-10 bg-gray-100 animate-pulse rounded-xl w-full" style={{ height: '2.5rem', width: '100%', backgroundColor: '#F3F4F6' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredDemands.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {filteredDemands.map((demand) => (
                            <DemandCard key={demand.id} demand={demand} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 border-dashed" style={{ padding: '6rem 0', backgroundColor: 'white', borderRadius: '1.5rem', border: '1px dashed #E5E7EB' }}>
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center" style={{ width: '6rem', height: '6rem', margin: '0 auto 1.5rem', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Search className="w-10 h-10 text-gray-300" style={{ width: '2.5rem', height: '2.5rem', color: '#D1D5DB' }} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>No demands found</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto" style={{ color: '#6B7280', marginBottom: '2rem', maxWidth: '24rem', margin: '0 auto 2rem' }}>
                            We couldn't find any demands matching your current filters. Try adjusting your search or category.
                        </p>
                        <button
                            onClick={() => {
                                setSelectedCategory('all');
                                setSearchQuery('');
                            }}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-orange-500 text-orange-600 font-semibold hover:bg-orange-50 active:scale-95 transition-all"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 2rem',
                                borderRadius: '9999px',
                                border: '2px solid #F97316',
                                color: '#EA580C',
                                fontWeight: '600',
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <X className="w-5 h-5" />
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#F9FAFB' }}>
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="h-10 bg-gray-100 rounded w-48 mb-4 animate-pulse" />
                    <div className="h-6 bg-gray-100 rounded w-96 mb-8 animate-pulse" />
                    <div className="h-14 bg-gray-100 rounded-2xl w-full mb-8 animate-pulse" />
                    <div className="flex gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-10 w-24 bg-gray-100 rounded-full animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DemandsPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <DemandsContent />
        </Suspense>
    );
}
