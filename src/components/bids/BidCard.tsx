'use client';

import React from 'react';
import { Bid } from '@/lib/firebase/firestore';
import { formatCurrency, formatTimeAgo } from '@/lib/utils/formatters';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { MapPin, Store, Check } from 'lucide-react';

interface BidCardProps {
    bid: Bid;
    onAccept?: (bidId: string) => void;
    isOwner?: boolean;
    isAccepted?: boolean;
}

const BidCard: React.FC<BidCardProps> = ({
    bid,
    onAccept,
    isOwner = false,
    isAccepted = false,
}) => {
    const openInMaps = () => {
        const { lat, lng } = bid.shopLocation;
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
    };

    return (
        <Card className={`${isAccepted ? 'ring-2 ring-green-500' : ''}`}>
            <div className="flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                        src={bid.imageURL}
                        alt="Bid item"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <h4 className="font-semibold text-gray-900">{bid.shopName}</h4>
                            <p className="text-sm text-gray-500">{bid.sellerName}</p>
                        </div>
                        {isAccepted && (
                            <Badge variant="success">
                                <Check className="w-3 h-3 mr-1" />
                                Accepted
                            </Badge>
                        )}
                    </div>

                    {/* Price */}
                    <div className="text-xl font-bold text-orange-500 mb-2">
                        {formatCurrency(bid.offerPrice)}
                    </div>

                    {/* Description */}
                    {bid.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {bid.description}
                        </p>
                    )}

                    {/* Availability Badge */}
                    <Badge
                        variant={bid.availability === 'in_stock' ? 'success' : 'warning'}
                        size="sm"
                    >
                        {bid.availability === 'in_stock' ? 'In Stock' : 'Can Arrange'}
                    </Badge>

                    {/* Time */}
                    <p className="text-xs text-gray-400 mt-2">
                        {formatTimeAgo(bid.createdAt)}
                    </p>
                </div>
            </div>

            {/* Actions for buyer */}
            {isOwner && !isAccepted && bid.status === 'pending' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={openInMaps}
                        leftIcon={<MapPin className="w-4 h-4" />}
                    >
                        View Location
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onAccept?.(bid.id)}
                        leftIcon={<Check className="w-4 h-4" />}
                    >
                        Accept Bid
                    </Button>
                </div>
            )}

            {/* Show location for accepted bid */}
            {isAccepted && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Store className="w-4 h-4" />
                        <span>{bid.shopLocation.address}</span>
                    </div>
                    <Button
                        size="sm"
                        fullWidth
                        onClick={openInMaps}
                        leftIcon={<MapPin className="w-4 h-4" />}
                    >
                        Get Directions
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default BidCard;
