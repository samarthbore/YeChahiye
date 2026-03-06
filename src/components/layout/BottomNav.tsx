'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, Store, User, ClipboardList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BottomNav: React.FC = () => {
    const pathname = usePathname();
    const { user, userProfile } = useAuth();

    const isSeller = userProfile?.role === 'seller' || userProfile?.role === 'both';

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/demands', icon: Search, label: 'Browse' },
        { href: '/demands/new', icon: PlusCircle, label: 'Post', primary: true },
        ...(user ? [{ href: '/my-demands', icon: ClipboardList, label: 'My Demands' }] : []),
        { href: user ? '/profile' : '/login', icon: User, label: user ? 'Profile' : 'Login' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 md:hidden pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.primary) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative -mt-6"
                            >
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                                    style={{
                                        background: 'linear-gradient(135deg, #FF6B35 0%, #E64A19 100%)',
                                        boxShadow: '0 4px 14px rgba(255, 107, 53, 0.4)',
                                    }}
                                >
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex flex-col items-center gap-0.5 px-3 py-2
                transition-colors
                ${isActive ? 'text-orange-500' : 'text-gray-400'}
              `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : ''}`} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
