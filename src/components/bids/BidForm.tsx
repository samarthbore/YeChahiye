'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createBid, createNotification, Demand } from '@/lib/firebase/firestore';
import { uploadBidImage, validateImageFile } from '@/lib/firebase/storage';
import { validateOfferPrice } from '@/lib/utils/validators';
import { formatBudgetRange } from '@/lib/utils/formatters';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface BidFormProps {
    demand: Demand;
    onSuccess?: () => void;
}

const BidForm: React.FC<BidFormProps> = ({ demand, onSuccess }) => {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        offerPrice: '',
        description: '',
        availability: 'in_stock' as 'in_stock' | 'can_arrange',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.valid) {
            toast.error(validation.error || 'Invalid image');
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!imageFile) {
            newErrors.image = 'Please upload a photo of your item';
        }

        const price = parseInt(formData.offerPrice);
        if (!formData.offerPrice) {
            newErrors.offerPrice = 'Please enter your offer price';
        } else {
            const priceValidation = validateOfferPrice(price, demand.budget.max);
            if (!priceValidation.valid) {
                newErrors.offerPrice = priceValidation.error || '';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !userProfile) {
            toast.error('Please login to submit a bid');
            router.push('/login');
            return;
        }

        if (userProfile.role !== 'seller' && userProfile.role !== 'both') {
            toast.error('Only sellers can submit bids');
            return;
        }

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const tempBidId = `temp_${Date.now()}`;

            // Upload image
            const imageURL = await uploadBidImage(imageFile!, tempBidId);

            // Create bid
            await createBid({
                demandId: demand.id,
                sellerId: user.uid,
                sellerName: userProfile.name || 'Seller',
                shopName: userProfile.shopName || 'Shop',
                offerPrice: parseInt(formData.offerPrice),
                imageURL,
                description: formData.description,
                availability: formData.availability,
                shopLocation: {
                    lat: userProfile.location?.lat || 20.9320,
                    lng: userProfile.location?.lng || 77.7523,
                    address: userProfile.shopAddress || 'Amravati, Maharashtra',
                },
            });

            // Notify the buyer about the new bid
            await createNotification({
                userId: demand.buyerId,
                type: 'new_bid',
                title: 'New Bid Received!',
                message: `${userProfile.shopName || userProfile.name} offered ₹${formData.offerPrice} for "${demand.title}"`,
                linkTo: `/demands/${demand.id}`,
            });

            toast.success('Bid submitted successfully!');
            onSuccess?.();
        } catch (error) {
            console.error('Error submitting bid:', error);
            toast.error('Failed to submit bid. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Demand Info */}
            <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-1">Bidding for:</h4>
                <p className="text-gray-600">{demand.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                    Budget: {formatBudgetRange(demand.budget.min, demand.budget.max)}
                </p>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo of Your Item <span className="text-red-500">*</span>
                </label>

                {imagePreview ? (
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`
              w-full aspect-square rounded-xl border-2 border-dashed
              flex flex-col items-center justify-center gap-3
              transition-colors
              ${errors.image
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50'
                            }
            `}
                    >
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                            <Camera className="w-7 h-7 text-gray-400" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-gray-700">Upload item photo</p>
                            <p className="text-sm text-gray-500">Show what you have in stock</p>
                        </div>
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                />

                {errors.image && (
                    <p className="mt-2 text-sm text-red-500">{errors.image}</p>
                )}
            </div>

            {/* Offer Price */}
            <Input
                label="Your Offer Price (₹)"
                type="number"
                placeholder="Enter your price"
                value={formData.offerPrice}
                onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                error={errors.offerPrice}
            />

            {/* Availability */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, availability: 'in_stock' })}
                        className={`
              p-3 rounded-xl border-2 transition-all text-center
              ${formData.availability === 'in_stock'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }
            `}
                    >
                        <span className="font-medium">In Stock</span>
                        <p className="text-xs text-gray-500 mt-0.5">Ready now</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, availability: 'can_arrange' })}
                        className={`
              p-3 rounded-xl border-2 transition-all text-center
              ${formData.availability === 'can_arrange'
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }
            `}
                    >
                        <span className="font-medium">Can Arrange</span>
                        <p className="text-xs text-gray-500 mt-0.5">Need time</p>
                    </button>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                </label>
                <textarea
                    placeholder="Add any details about your item..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400
            bg-white border border-gray-200 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
            hover:border-gray-300 transition-all"
                />
            </div>

            {/* Submit */}
            <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
            >
                Submit Bid
            </Button>
        </form>
    );
};

export default BidForm;
