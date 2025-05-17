'use client';
// components/ProfileCard.tsx
import { useState, ChangeEvent, FC } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon  } from '@heroicons/react/24/outline';

interface Profile {
    avatarUrl: string;
    username: string;
    email: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
}

export const ProfileCard: FC<{ initialProfile: Profile }> = ({ initialProfile }) => {
    const [profile, setProfile] = useState(initialProfile);
    const [editField, setEditField] = useState<keyof Profile | null>(null);
    const [draftValue, setDraftValue] = useState<string>('');

    const startEdit = (field: keyof Profile) => {
        setDraftValue(String(profile[field]));
        setEditField(field);
    };
    const cancelEdit = () => setEditField(null);
    const saveEdit = () => {
        if (editField) {
            setProfile({
                ...profile,
                [editField]:
                    editField === 'age'
                        ? Number(draftValue)
                        : draftValue,
            } as Profile);
            setEditField(null);
        }
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfile(prev => ({
                    ...prev,
                    avatarUrl: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Top Banner + Avatar */}
            <div className="h-24 bg-amber-100 relative">
                <div className="w-24 h-24 rounded-full border-4 border-white absolute left-1/2 transform -translate-x-1/2 top-12 group">
                    <img
                        className="w-full h-full object-cover rounded-full"
                        src={profile.avatarUrl}
                        alt="Avatar"
                    />
                    <label className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                        <PencilIcon className="w-6 h-6 text-white" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            <div className="pt-16 pb-8 px-6">
                {/* Username */}
                <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold">{profile.username}</h2>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                </div>

                <div className="divide-y divide-gray-200">
                    {(['email', 'username', 'age', 'gender'] as (keyof Profile)[]).map((field) => {
                        const label = field.charAt(0).toUpperCase() + field.slice(1);
                        const isEditing = editField === field;
                        const value = isEditing ? draftValue : String(profile[field]);

                        return (
                            <div key={field} className="py-3 flex items-center justify-between">
                                <div className="text-gray-600 w-24">{label}</div>
                                <div className="flex-1">
                                    {isEditing ? (
                                        <input
                                            type={field === 'age' ? 'number' : 'text'}
                                            value={draftValue}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setDraftValue(e.target.value)}
                                            className="w-full px-2 py-1 border rounded"
                                        />
                                    ) : (
                                        <span className="text-gray-800">{value}</span>
                                    )}
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                    {isEditing ? (
                                        <div className="flex space-x-2">
                                            <button onClick={saveEdit} className="p-1 hover:text-green-600 cursor-pointer">
                                                <CheckIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={cancelEdit} className="p-1 hover:text-red-600 cursor-pointer">
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => startEdit(field)} className="p-1 hover:text-blue-600 cursor-pointer">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
