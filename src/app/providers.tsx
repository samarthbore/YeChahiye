'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { Header, BottomNav } from '@/components/layout';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1F2937',
                        color: '#F9FAFB',
                        borderRadius: '12px',
                        padding: '12px 16px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#22C55E',
                            secondary: '#F9FAFB',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#F9FAFB',
                        },
                    },
                }}
            />
            <Header />
            <main className="min-h-screen pb-20 md:pb-0 bg-white">
                {children}
            </main>
            <BottomNav />
        </AuthProvider>
    );
}
