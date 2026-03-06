'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Store, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveDemands, Demand } from '@/lib/firebase/firestore';
import Button from '@/components/ui/Button';
import { DemandCard } from '@/components/demands';

const categories = [
  { id: 'clothing', label: 'Clothing', emoji: '👔', color: 'bg-blue-100' },
  { id: 'fashion', label: 'Fashion', emoji: '👗', color: 'bg-pink-100' },
  { id: 'textiles', label: 'Textiles', emoji: '🧵', color: 'bg-amber-100' },
  { id: 'accessories', label: 'Accessories', emoji: '👜', color: 'bg-purple-100' },
];

export default function Home() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [recentDemands, setRecentDemands] = useState<Demand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDemands = async () => {
      try {
        const demands = await getActiveDemands();
        setRecentDemands(demands.slice(0, 6));
      } catch (error) {
        console.error('Error fetching demands:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemands();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section
        className="py-16 md:py-20"
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #7B1FA2 100%)',
          paddingTop: '5rem',
          paddingBottom: '5rem',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white mb-8 shadow-lg mx-auto md:mx-0"
              style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              <span className="font-bold text-base tracking-wide" style={{ fontWeight: 'bold', fontSize: '1rem', letterSpacing: '0.025em', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Aapki demand, market ka offer.</span>
            </div>

            {/* Heading */}
            <h1
              className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
              style={{ marginBottom: '1rem', lineHeight: '1.2' }}
            >
              Find What You Need,<br />
              <span className="text-yellow-300" style={{ color: '#FDE047' }}>Locally</span>
            </h1>

            {/* Description */}
            <p
              className="text-lg md:text-xl text-white/80 mb-8"
              style={{ marginBottom: '2rem', fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)' }}
            >
              Post what you're looking for and let local shopkeepers in Busyland & nearby markets come to you with the best offers.
            </p>

            {/* Search Bar */}
            <div className="flex justify-center w-full mb-8" style={{ marginBottom: '3rem' }}>
              <div className="relative w-full max-w-[22rem]">
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="What are you looking for today?"
                  className="w-full h-14 rounded-2xl bg-white text-gray-900 placeholder-gray-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30 transition-shadow"
                  style={{
                    width: '100%',
                    height: '3.5rem',
                    paddingLeft: '3rem',
                    paddingRight: '1rem',
                    borderRadius: '1rem',
                    border: 'none',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <button
                onClick={() => router.push('/demands/new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '9999px', backgroundColor: '#fff', color: '#ea580c' }}
              >
                <ShoppingBag className="w-5 h-5" />
                Post Your Demand
              </button>

              {(userProfile?.role === 'seller' || userProfile?.role === 'both') && (
                <button
                  onClick={() => router.push('/seller/dashboard')}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '2px solid white', color: '#fff' }}
                >
                  <Store className="w-5 h-5" />
                  Seller Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white" style={{ padding: '3rem 0', backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>Categories</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/demands?category=${cat.id}`}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '1rem',
                  border: '1px solid #f3f4f6',
                  transition: 'background-color 0.2s',
                  textDecoration: 'none'
                }}
              >
                <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-3xl`} style={{ width: '4rem', height: '4rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.875rem', backgroundColor: cat.color.replace('bg-', 'var(--color-') }}>
                  {cat.emoji}
                </div>
                <span className="text-sm font-medium text-gray-700" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Demands Section */}
      <section className="py-12 bg-gray-50" style={{ padding: '4rem 0', backgroundColor: '#F9FAFB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div className="flex items-center justify-between mb-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Recent Demands</h2>
            <Link
              href="/demands"
              className="flex items-center gap-1 text-orange-500 font-medium hover:text-orange-600"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F97316' }}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] skeleton" style={{ aspectRatio: '4/3', backgroundColor: '#e5e7eb' }} />
                  <div className="p-4 space-y-3">
                    <div className="h-5 skeleton rounded w-3/4" style={{ height: '1.25rem', width: '75%', backgroundColor: '#e5e7eb', marginBottom: '0.75rem' }} />
                    <div className="h-4 skeleton rounded w-1/2" style={{ height: '1rem', width: '50%', backgroundColor: '#e5e7eb' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : recentDemands.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {recentDemands.map((demand) => (
                <DemandCard key={demand.id} demand={demand} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl" style={{ padding: '4rem 0', backgroundColor: 'white', borderRadius: '1rem', marginBottom: '2rem' }}>
              <div
                className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
                style={{ width: '5rem', height: '5rem', margin: '0 auto 1.5rem', backgroundColor: '#f3f4f6', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>No demands yet</h3>
              <p className="text-gray-500 mb-6" style={{ color: '#6b7280', marginBottom: '2rem' }}>Be the first to post what you're looking for!</p>
              <Button onClick={() => router.push('/demands/new')}>Post Your Demand</Button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white" style={{ padding: '5rem 0', backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12" style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '4rem' }}>
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            {[
              {
                step: '1',
                title: 'Post Your Demand',
                description: 'Upload a photo and describe what you\'re looking for with your budget.',
                icon: '📸',
              },
              {
                step: '2',
                title: 'Receive Bids',
                description: 'Local shopkeepers will send you offers with photos of matching items.',
                icon: '🏪',
              },
              {
                step: '3',
                title: 'Visit & Buy',
                description: 'Choose the best offer and visit the shop to make your purchase.',
                icon: '🎉',
              },
            ].map((item) => (
              <div key={item.step} className="text-center" style={{ textAlign: 'center' }}>
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl"
                  style={{
                    width: '5rem',
                    height: '5rem',
                    margin: '0 auto 1.5rem',
                    background: 'linear-gradient(135deg, #FF6B35 0%, #E64A19 100%)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem'
                  }}
                >
                  {item.icon}
                </div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-3"
                  style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500', marginBottom: '1rem', backgroundColor: '#FFE4D6', color: '#BF360C' }}
                >
                  Step {item.step}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#111827' }}>{item.title}</h3>
                <p className="text-gray-500" style={{ color: '#6b7280', lineHeight: '1.6' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA Section */}
      <section
        className="py-16"
        style={{
          background: 'linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)',
          padding: '5rem 0'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div className="text-center max-w-2xl mx-auto" style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto' }}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>
              Are You a Shopkeeper?
            </h2>
            <p className="text-white/80 mb-8" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', fontSize: '1.125rem' }}>
              Join YeChahiye to receive customer demands directly. Respond with your best offers and grow your business!
            </p>
            <button
              onClick={() => router.push(user ? '/profile?upgrade=seller' : '/login')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors text-lg"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                backgroundColor: 'white',
                color: '#7e22ce',
                fontWeight: '600',
                borderRadius: '9999px',
                fontSize: '1.125rem'
              }}
            >
              {user ? 'Become a Seller' : 'Get Started'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
