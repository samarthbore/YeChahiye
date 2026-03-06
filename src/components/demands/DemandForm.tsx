'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { addHours } from 'date-fns';
import { Camera, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createDemand } from '@/lib/firebase/firestore';
import { uploadDemandImage, validateImageFile } from '@/lib/firebase/storage';
import { validateTitle, validateDescription, validateBudget } from '@/lib/utils/validators';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const categories = [
    { value: 'clothing', label: 'Clothing', emoji: '👔' },
    { value: 'fashion', label: 'Fashion', emoji: '👗' },
    { value: 'textiles', label: 'Textiles', emoji: '🧵' },
    { value: 'accessories', label: 'Accessories', emoji: '👜' },
];

const DemandForm: React.FC = () => {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'clothing',
        budgetMin: '',
        budgetMax: '',
        targetMarketArea: '',
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
            newErrors.image = 'Please upload an image of what you want';
        }

        const titleValidation = validateTitle(formData.title);
        if (!titleValidation.valid) {
            newErrors.title = titleValidation.error || '';
        }

        const descValidation = validateDescription(formData.description);
        if (!descValidation.valid) {
            newErrors.description = descValidation.error || '';
        }

        const min = parseInt(formData.budgetMin);
        const max = parseInt(formData.budgetMax);

        if (!formData.budgetMin || !formData.budgetMax) {
            newErrors.budget = 'Please enter your budget range';
        } else {
            const budgetValidation = validateBudget(min, max);
            if (!budgetValidation.valid) {
                newErrors.budget = budgetValidation.error || '';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !userProfile) {
            toast.error('Please login to post a demand');
            router.push('/login');
            return;
        }

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // First create demand to get ID
            const tempDemandId = `temp_${Date.now()}`;

            // Upload image
            const imageURL = await uploadDemandImage(imageFile!, tempDemandId);

            // Create demand in Firestore
            const demandId = await createDemand({
                buyerId: user.uid,
                buyerName: userProfile.name || 'Anonymous',
                title: formData.title,
                description: formData.description,
                category: formData.category as 'clothing' | 'fashion' | 'textiles' | 'accessories',
                imageURL,
                budget: {
                    min: parseInt(formData.budgetMin),
                    max: parseInt(formData.budgetMax),
                },
                location: {
                    lat: userProfile.location?.lat || 20.9320,
                    lng: userProfile.location?.lng || 77.7523,
                    address: 'Amravati, Maharashtra',
                },
                targetMarketArea: formData.targetMarketArea || null,
                status: 'active',
                expiresAt: Timestamp.fromDate(addHours(new Date(), 24)),
            });

            toast.success('Demand posted successfully!');
            router.push(`/demands/${demandId}`);
        } catch (error) {
            console.error('Error creating demand:', error);
            toast.error('Failed to post demand. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload */}
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 ml-1">
                    Upload Photo <span className="text-orange-500">*</span>
                </label>

                {imagePreview ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100 group">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={removeImage}
                                className="px-4 py-2 bg-white rounded-full text-red-500 font-bold shadow-lg transform scale-95 group-hover:scale-100 transition-all"
                            >
                                Remove Photo
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`
              w-full aspect-video rounded-2xl border-2 border-dashed
              flex flex-col items-center justify-center gap-4
              transition-all duration-200 group
              ${errors.image
                                ? 'border-red-300 bg-red-50/50'
                                : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50/50 bg-gray-50'
                            }
            `}
                    >
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera className={`w-8 h-8 ${errors.image ? 'text-red-400' : 'text-orange-500'}`} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-700 text-lg">Upload Product Photo</p>
                            <p className="text-sm text-gray-500 mt-1">Tap here to choose from gallery</p>
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
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <X className="w-4 h-4" /> {errors.image}
                    </p>
                )}
            </div>

            {/* Inputs Section */}
            <div className="space-y-6">
                <Input
                    label="What are you looking for?"
                    placeholder="e.g. Red Banarasi Silk Saree"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={errors.title}
                />

                {/* Category */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 ml-1">
                        Category
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, category: cat.value })}
                                className={`
                    flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                    ${formData.category === cat.value
                                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                                        : 'border-gray-100 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/30'
                                    }
                  `}
                            >
                                <span className="text-2xl">{cat.emoji}</span>
                                <span className="font-bold text-sm sm:text-base whitespace-nowrap">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2 ml-1">
                        Description
                    </label>
                    <textarea
                        placeholder="Describe details like color, fabric, size, pattern..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className={`
                w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400
                bg-gray-50 border rounded-xl
                transition-all duration-200 resize-none
                focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                focus:bg-white
                ${errors.description ? 'border-red-300 bg-red-50/10' : 'border-gray-200 hover:border-orange-300'}
              `}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                </div>

                {/* Budget */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 ml-1">
                        Your Budget
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <Input
                                type="number"
                                placeholder="Min Price"
                                value={formData.budgetMin}
                                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                                leftIcon={<span className="text-gray-500 font-semibold">₹</span>}
                                className="pl-14"
                            />
                        </div>
                        <span className="text-gray-400 font-medium">-</span>
                        <div className="flex-1">
                            <Input
                                type="number"
                                placeholder="Max Price"
                                value={formData.budgetMax}
                                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                                leftIcon={<span className="text-gray-500 font-semibold">₹</span>}
                                className="pl-14"
                            />
                        </div>
                    </div>
                    {errors.budget && (
                        <p className="mt-2 text-sm text-red-500">{errors.budget}</p>
                    )}
                </div>

                {/* Target Market Area (Optional) */}
                <Input
                    label="Preferred Market Area (Optional)"
                    placeholder="e.g., Busyland, Rajapeth"
                    value={formData.targetMarketArea}
                    onChange={(e) => setFormData({ ...formData, targetMarketArea: e.target.value })}
                    hint="Leave empty to receive bids from all areas"
                />
            </div>

            {/* Submit */}
            <div className="pt-4">
                <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    isLoading={isSubmitting}
                    className="shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 text-lg py-4"
                >
                    Post Demand
                </Button>
                <p className="text-center text-sm text-gray-400 mt-4">
                    Your demand will be active for 24 hours
                </p>
            </div>
        </form>
    );
};

export default DemandForm;
