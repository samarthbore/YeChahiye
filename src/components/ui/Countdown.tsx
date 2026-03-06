'use client';

import React, { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { getTimeRemaining, formatCountdown } from '@/lib/utils/formatters';

interface CountdownProps {
    expiresAt: Timestamp | Date;
    onExpire?: () => void;
    className?: string;
    showLabel?: boolean;
}

const Countdown: React.FC<CountdownProps> = ({
    expiresAt,
    onExpire,
    className = '',
    showLabel = true,
}) => {
    const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining(expiresAt));

    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = getTimeRemaining(expiresAt);
            setTimeRemaining(remaining);

            if (remaining.isExpired) {
                clearInterval(interval);
                onExpire?.();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, onExpire]);

    if (timeRemaining.isExpired) {
        return (
            <div className={`flex items-center gap-1.5 text-red-500 ${className}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm">Expired</span>
            </div>
        );
    }

    const isUrgent = timeRemaining.totalSeconds < 3600; // Less than 1 hour

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <svg
                className={`w-4 h-4 ${isUrgent ? 'text-amber-500 animate-pulse' : 'text-gray-500'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <div className="flex items-baseline gap-1">
                {showLabel && <span className="text-xs text-gray-500">Expires in</span>}
                <span
                    className={`
            font-mono font-semibold text-sm
            ${isUrgent ? 'text-amber-500' : 'text-gray-700'}
          `}
                >
                    {formatCountdown(timeRemaining.hours, timeRemaining.minutes, timeRemaining.seconds)}
                </span>
            </div>
        </div>
    );
};

export default Countdown;
