'use client';
import { useState, ChangeEvent, FC, useEffect } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
    avatarUrl: string;
    username: string;
    email: string;
    age: number;
    gender: string;
    favoriteTeam: string | null;
    favoriteTeamId?: number | null;
}

type SaveResult = { success: boolean; message?: string };
type ProfileCardProps = {
    initialProfile: Profile;
    onProfileSave?: (profile: Profile, avatarFile?: File) => Promise<SaveResult>;
    isLoading?: boolean;
};

export const ProfileCard: FC<ProfileCardProps> = ({
    initialProfile,
    onProfileSave,
    isLoading = false
}) => {
    const [profile, setProfile] = useState<Profile>(initialProfile);
    const [editField, setEditField] = useState<keyof Profile | null>(null);
    const [draftValue, setDraftValue] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [highlighted, setHighlighted] = useState<keyof Profile | null>(null);

    // Highlight field when starting to edit
    useEffect(() => {
        if (editField) {
            setHighlighted(editField);
            const timer = setTimeout(() => setHighlighted(null), 700);
            return () => clearTimeout(timer);
        }
    }, [editField]);

    const startEdit = (field: keyof Profile) => {
        setDraftValue(String(profile[field] || ''));
        setEditField(field);
    };

    const cancelEdit = () => setEditField(null);

    const saveEdit = async () => {
        if (editField) {
            const updated = {
                ...profile,
                [editField]: editField === 'age' ? Number(draftValue) : draftValue,
            } as Profile;
            setProfile(updated);
            setEditField(null);

            if (onProfileSave) {
                await saveProfile(updated);
            }
        }
    };

    const saveProfile = async (updatedProfile: Profile, newAvatarFile?: File) => {
        if (onProfileSave) {
            setSaving(true);
            setFeedback(null);

            try {
                const result = await onProfileSave(updatedProfile, newAvatarFile || avatarFile || undefined);

                setFeedback(result.success
                    ? { type: 'success', message: 'Profile updated!' }
                    : { type: 'error', message: result.message || 'Update failed.' });

                // Clear avatar file after successful save
                if (result.success && avatarFile) {
                    setAvatarFile(null);
                }
            } catch (error) {
                setFeedback({ type: 'error', message: 'An unexpected error occurred.' });
            } finally {
                setSaving(false);
                // Clear feedback after a delay
                setTimeout(() => setFeedback(null), 3000);
            }
        }
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Store the file for later upload
            setAvatarFile(file);

            // Show preview image
            const reader = new FileReader();
            reader.onload = () => {
                setProfile(prev => ({
                    ...prev,
                    avatarUrl: reader.result as string
                }));
            };
            reader.readAsDataURL(file);

            // Automatically trigger save if onProfileSave is provided
            if (onProfileSave) {
                saveProfile(profile, file).then();
            }
        }
    };

    return (
        <motion.div
            className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{
                scale: 1.02,
                rotateX: 2,
                rotateY: 2,
                boxShadow: "0 25px 50px -12px rgba(245, 158, 11, 0.5)"
            }}
            transition={{ duration: 0.5 }}
        >
            {/* Header with wave animation */}
            <motion.div
                className="h-24 bg-gradient-to-r from-amber-300 to-amber-100 relative overflow-hidden"
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                    repeat: Infinity,
                    duration: 15,
                    ease: "linear"
                }}
            >
                <div className="absolute inset-0 bg-pattern opacity-20"></div>
            </motion.div>

            {/* Avatar section - separated from header for proper positioning */}
            <div className="relative flex justify-center">
                <motion.div
                    className="w-28 h-28 rounded-full border-4 border-white bg-white absolute -top-14 group shadow-lg z-10"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                    {isLoading ? (
                        <div className="w-full h-full rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
                            <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <motion.img
                                className="w-full h-full object-cover rounded-full"
                                src={profile.avatarUrl || '/default-avatar.png'}
                                alt={`${profile.username}'s avatar`}
                                whileHover={{ scale: 1.05 }}
                            />
                            <motion.label
                                className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition"
                                aria-label="Change profile picture"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <PencilIcon className="w-6 h-6 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    disabled={saving}
                                />
                            </motion.label>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Content section - adjusted padding to accommodate avatar */}
            <motion.div
                className="pt-16 pb-8 px-8" // Changed from pt-24 to pt-16
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <motion.div className="text-center mb-4">
                    <motion.h2
                        className="text-2xl font-bold text-gray-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {profile.username}
                    </motion.h2>
                    <motion.p
                        className="text-sm text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {profile.email}
                    </motion.p>
                </motion.div>
                {profile.favoriteTeam && (
                    <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <span className="inline-block bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 rounded-full px-4 py-1 text-xs font-semibold">
                            Favorite Team: {profile.favoriteTeam}
                        </span>
                    </motion.div>
                )}
                <div className="divide-y divide-gray-200">
                    {(['email', 'username', 'age'] as (keyof Profile)[]).map((field, index) => {
                        const label = field.charAt(0).toUpperCase() + field.slice(1);
                        const isEditing = editField === field;
                        const value = isEditing ? draftValue : String(profile[field] || '');
                        const isHighlighted = highlighted === field;

                        return (
                            <motion.div
                                key={field}
                                className={`py-3 flex items-center justify-between rounded-lg ${isHighlighted ? 'highlight-field' : ''}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                <div className="text-gray-600 w-28 font-medium">{label}</div>
                                <AnimatePresence mode="wait">
                                    {isEditing ? (
                                        <motion.div
                                            className="flex-1"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key="editing"
                                        >
                                            <input
                                                type={field === 'age' ? 'number' : 'text'}
                                                value={draftValue}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => setDraftValue(e.target.value)}
                                                className="w-full px-2 py-1 border rounded focus:ring-amber-400 focus:border-amber-400 transition-all"
                                                aria-label={`Edit ${label}`}
                                                autoFocus
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            className="flex-1"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key="viewing"
                                        >
                                            <span className="text-gray-800">{value}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="ml-4 flex-shrink-0">
                                    <AnimatePresence mode="wait">
                                        {isEditing ? (
                                            <motion.div
                                                className="flex space-x-2"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                key="edit-buttons"
                                            >
                                                <motion.button
                                                    onClick={saveEdit}
                                                    disabled={saving}
                                                    className="p-1 text-green-600 cursor-pointer bg-green-50 rounded-full hover:bg-green-100 transition-colors"
                                                    aria-label="Save changes"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <CheckIcon className="w-5 h-5" />
                                                </motion.button>
                                                <motion.button
                                                    onClick={cancelEdit}
                                                    disabled={saving}
                                                    className="p-1 text-red-600 cursor-pointer bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                                                    aria-label="Cancel editing"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <XMarkIcon className="w-5 h-5" />
                                                </motion.button>
                                            </motion.div>
                                        ) : (
                                            <motion.button
                                                onClick={() => startEdit(field)}
                                                className="p-1 text-blue-600 cursor-pointer bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                                                aria-label={`Edit ${label}`}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key="edit-button"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Gender Selection with Dropdown */}
                    <motion.div
                        key="gender-field"
                        className={`py-3 flex items-center justify-between rounded-lg ${highlighted === 'gender' ? 'highlight-field' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="text-gray-600 w-28 font-medium">Gender</div>
                        <AnimatePresence mode="wait">
                            {editField === 'gender' ? (
                                <motion.div
                                    className="flex-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    key="editing-gender"
                                >
                                    <select
                                        value={draftValue}
                                        onChange={(e) => setDraftValue(e.target.value)}
                                        className="w-full px-2 py-1 border rounded focus:ring-amber-400 focus:border-amber-400 transition-all"
                                        aria-label="Edit Gender"
                                        autoFocus
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="flex-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    key="viewing-gender"
                                >
                                    <span className="text-gray-800">{profile.gender || 'Not specified'}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="ml-4 flex-shrink-0">
                            <AnimatePresence mode="wait">
                                {editField === 'gender' ? (
                                    <motion.div
                                        className="flex space-x-2"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        key="edit-gender-buttons"
                                    >
                                        <motion.button
                                            onClick={saveEdit}
                                            disabled={saving}
                                            className="p-1 text-green-600 cursor-pointer bg-green-50 rounded-full hover:bg-green-100 transition-colors"
                                            aria-label="Save changes"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <CheckIcon className="w-5 h-5" />
                                        </motion.button>
                                        <motion.button
                                            onClick={cancelEdit}
                                            disabled={saving}
                                            className="p-1 text-red-600 cursor-pointer bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                                            aria-label="Cancel editing"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        onClick={() => startEdit('gender')}
                                        className="p-1 text-blue-600 cursor-pointer bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                                        aria-label="Edit Gender"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key="edit-gender-button"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Feedback message for save operations */}
                    <AnimatePresence>
                        {feedback && (
                            <motion.div
                                className={`mt-6 p-3 rounded-lg ${
                                    feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {feedback.message}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};
