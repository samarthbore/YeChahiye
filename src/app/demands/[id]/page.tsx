'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDemand, Demand, subscribeToBidsForDemand, Bid, updateBid, updateDemand } from '@/lib/firebase/firestore';
import { formatBudgetRange, formatTimeAgo } from '@/lib/utils/formatters';
import { Button, Badge, Card, Countdown, Modal } from '@/components/ui';
import { BidCard, BidForm } from '@/components/bids';
import toast from 'react-hot-toast';

const categoryLabels: Record<string, string> = {
    clothing: 'Clothing',
    fashion: 'Fashion',
    textiles: 'Textiles',
    accessories: 'Accessories',
};

export default function DemandDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, userProfile } = useAuth();

    const [demand, setDemand] = useState<Demand | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showBidModal, setShowBidModal] = useState(false);

    const demandId = params.id as string;
    const isOwner = user?.uid === demand?.buyerId;
    const isSeller = userProfile?.role === 'seller' || userProfile?.role === 'both';
    const hasAlreadyBid = bids.some((bid) => bid.sellerId === user?.uid);
    const acceptedBid = bids.find((bid) => bid.status === 'accepted');

    useEffect(() => {
        const fetchDemand = async () => {
            try {
                const demandData = await getDemand(demandId);
                setDemand(demandData);
            } catch (error) {
                console.error('Error fetching demand:', error);
                toast.error('Failed to load demand');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDemand();
    }, [demandId]);

    useEffect(() => {
        if (!demandId) return;

        const unsubscribe = subscribeToBidsForDemand(demandId, (bidsData) => {
            setBids(bidsData);
        });

        return () => unsubscribe();
    }, [demandId]);

    const handleAcceptBid = async (bidId: string) => {
        try {
            // Update bid status
            await updateBid(bidId, { status: 'accepted' });

            // Update demand status
            await updateDemand(demandId, {
                status: 'matched',
                selectedBidId: bidId,
            });

            // Reject other bids
            const otherBids = bids.filter((b) => b.id !== bidId);
            for (const bid of otherBids) {
                await updateBid(bid.id, { status: 'rejected' });
            }

            toast.success('Bid accepted! Check the shop location below.');
        } catch (error) {
            console.error('Error accepting bid:', error);
            toast.error('Failed to accept bid');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!demand) {
        return (
            <div className="py-12 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center px-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Demand not found</h1>
                    <p className="text-gray-500 mb-6">This demand may have been removed or expired.</p>
                    <Button onClick={() => router.push('/demands')}>Browse Demands</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Demand Image */}
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200 border border-gray-100 shadow-sm">
                            <img
                                src={demand.imageURL}
                                alt={demand.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Demand Info */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <Badge variant="primary" className="mb-2 bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">
                                        {categoryLabels[demand.category] || demand.category}
                                    </Badge>
                                    <h1 className="text-2xl font-bold text-gray-900">{demand.title}</h1>
                                </div>
                                <Countdown expiresAt={demand.expiresAt} />
                            </div>

                            <p className="text-gray-600 mb-6 leading-relaxed">{demand.description}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {demand.location?.address || 'Amravati'}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    Posted {formatTimeAgo(demand.createdAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                    {demand.bidCount || 0} bids
                                </div>
                            </div>

                            {demand.targetMarketArea && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-sm text-gray-600">
                                        📍 Preferred market: <span className="font-semibold text-gray-900">{demand.targetMarketArea}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Bids Section */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Bids ({bids.length})
                            </h2>

                            {bids.length > 0 ? (
                                <div className="space-y-4">
                                    {bids.map((bid) => (
                                        <BidCard
                                            key={bid.id}
                                            bid={bid}
                                            isOwner={isOwner}
                                            isAccepted={bid.status === 'accepted'}
                                            onAccept={handleAcceptBid}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm">
                                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No bids yet</p>
                                    {isSeller && !isOwner && (
                                        <p className="text-sm text-gray-400 mt-1">Be the first to make an offer!</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Budget Card */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm text-gray-500 mb-1 font-medium">Budget</p>
                                <p className="text-3xl font-bold text-orange-500">
                                    {formatBudgetRange(demand.budget.min, demand.budget.max)}
                                </p>
                            </div>

                            {/* Actions */}
                            {isSeller && !isOwner && demand.status === 'active' && (
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    {hasAlreadyBid ? (
                                        <div className="text-center">
                                            <p className="text-gray-600 mb-3">You've already bid on this demand</p>
                                            <Badge variant="success" className="bg-green-100 text-green-700">Bid Submitted</Badge>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-gray-600 mb-4">
                                                Have what the customer is looking for? Submit your offer!
                                            </p>
                                            <Button fullWidth onClick={() => setShowBidModal(true)}>
                                                Submit a Bid
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Status Messages */}
                            {demand.status === 'matched' && acceptedBid && (
                                <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                                    <div className="text-center">
                                        <Badge variant="success" size="md" className="mb-3 bg-green-100 text-green-700 border-none">Matched!</Badge>
                                        <p className="text-green-800 font-medium">
                                            {isOwner
                                                ? 'You accepted a bid. Visit the shop to complete your purchase!'
                                                : 'This demand has been matched with a seller.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {demand.status === 'expired' && (
                                <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
                                    <div className="text-center">
                                        <Badge variant="error" size="md" className="bg-red-100 text-red-700 border-none">Expired</Badge>
                                        <p className="text-red-700 mt-2 font-medium">This demand has expired.</p>
                                    </div>
                                </div>
                            )}

                            {/* Buyer Info */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm text-gray-500 mb-2">Posted by</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                        {demand.buyerName.charAt(0)}
                                    </div>
                                    <p className="font-medium text-gray-900">{demand.buyerName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bid Modal */}
                <Modal
                    isOpen={showBidModal}
                    onClose={() => setShowBidModal(false)}
                    title="Submit Your Bid"
                    size="lg"
                >
                    <BidForm
                        demand={demand}
                        onSuccess={() => setShowBidModal(false)}
                    />
                </Modal>
            </div>
        </div>
    );
}
