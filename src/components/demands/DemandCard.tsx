'use client';

import React from 'react';
import Link from 'next/link';
import { Demand } from '@/lib/firebase/firestore';
import { formatBudgetRange } from '@/lib/utils/formatters';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Countdown from '@/components/ui/Countdown';
import { MessageSquare, MapPin } from 'lucide-react';

interface DemandCardProps {
    demand: Demand;
    showBidButton?: boolean;
}

const categoryColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning'> = {
    clothing: 'primary',
    fashion: 'secondary',
    textiles: 'success',
    accessories: 'warning',
};

const categoryLabels: Record<string, string> = {
    clothing: 'Clothing',
    fashion: 'Fashion',
    textiles: 'Textiles',
    accessories: 'Accessories',
};

const DemandCard: React.FC<DemandCardProps> = ({ demand, showBidButton = true }) => {
    return (
        <Link href={`/demands/${demand.id}`}>
            <Card hover className="overflow-hidden h-full flex flex-col" padding="none">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                        src={demand.imageURL}
                        alt={demand.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                        <Badge variant={categoryColors[demand.category] || 'default'}>
                            {categoryLabels[demand.category] || demand.category}
                        </Badge>
                    </div>

                    {/* Timer */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                        <Countdown expiresAt={demand.expiresAt} showLabel={false} />
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {demand.title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                        {demand.description}
                    </p>

                    {/* Budget */}
                    <div className="mb-3">
                        <span className="text-lg font-bold text-orange-500">
                            {formatBudgetRange(demand.budget.min, demand.budget.max)}
                        </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        {/* Location */}
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-[120px]">
                                {demand.location?.address?.split(',')[0] || 'Amravati'}
                            </span>
                        </div>

                        {/* Bid count */}
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MessageSquare className="w-4 h-4" />
                            <span>{demand.bidCount || 0} bids</span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default DemandCard;
