'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Bell, X, Check, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    subscribeToUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    Notification,
} from '@/lib/firebase/firestore';
import { formatTimeAgo } from '@/lib/utils/formatters';

const notificationIcons: Record<string, string> = {
    new_bid: '💰',
    new_demand: '📢',
    bid_accepted: '✅',
    demand_expired: '⏰',
};

export default function NotificationBell() {
    const router = useRouter();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToUserNotifications(user.uid, (notifs) => {
            setNotifications(notifs.slice(0, 20)); // Limit to 20 most recent
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await markNotificationRead(notification.id);
        }
        setIsOpen(false);
        router.push(notification.linkTo);
    };

    const handleMarkAllRead = async () => {
        if (!user) return;
        await markAllNotificationsRead(user.uid);
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`
                                        w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors
                                        ${!notification.read ? 'bg-orange-50/50' : ''}
                                    `}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl flex-shrink-0">
                                            {notificationIcons[notification.type] || '🔔'}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 px-4">
                                <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No notifications yet</p>
                                <p className="text-gray-400 text-xs mt-1">
                                    You'll see updates here when sellers respond to your demands
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
