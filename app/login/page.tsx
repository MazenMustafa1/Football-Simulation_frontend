'use client';

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import authService from '../../Services/AuthenticationService';
import { motion } from "framer-motion";
import Image from "next/image";

const ModelViewer = dynamic(() => import("../Components/ModelViewer"), { ssr: false });

export default function SignIn() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = async () => {
        const email = (document.getElementById('LoggingEmailAddress') as HTMLInputElement | null)?.value || '';
        const password = (document.getElementById('loggingPassword') as HTMLInputElement | null)?.value || '';

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await authService.login({
                email,
                password
            });

            // Success animation before redirect
            setTimeout(() => {
                router.push('/dashboard');
            }, 500);
        } catch (error: any) {
            console.error('Error during login:', error);
            // Handle different error scenarios
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.status === 401) {
                    setError('Invalid email or password');
                } else if (error.response.data && error.response.data.message) {
                    setError(error.response.data.message);
                } else {
                    setError('Login failed. Please try again.');
                }
            } else if (error.request) {
                // The request was made but no response was received
                setError('No response from server. Please check your connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSignIn().then();
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#4CAF50]">
            {/* Stadium background with better opacity and overlay */}
            <div className="absolute inset-0 bg-[url('/images/Stadium dark.png')] bg-cover bg-center opacity-30"></div>
            {/* Football pattern overlay */}
            <div className="absolute inset-0 bg-[url('/images/football-pattern.png')] bg-repeat opacity-5"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative flex w-full max-w-sm mx-auto overflow-hidden rounded-2xl shadow-2xl lg:max-w-5xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
            >
                {/* Left Side 3D Player with enhanced styling */}
                <div className="w-0 lg:w-3/5 h-full relative overflow-hidden rounded-l-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4CAF50]/80 via-[#4CAF50]/40 to-transparent z-10"></div>

                    <div className="h-full w-full relative">
                        <ModelViewer />
                    </div>

                    {/* Football branding overlay with larger text */}
                    <div className="absolute bottom-10 left-10 z-20 text-white">
                        <h2 className="text-4xl font-extrabold tracking-tight mb-3 text-shadow-lg">FOOTEX</h2>
                        <p className="text-white/80 max-w-xs font-medium text-shadow-sm">Experience the beautiful game like never before.</p>
                    </div>

                    {/* Floating footballs animation */}
                    <motion.div
                        className="absolute top-20 right-20 h-20 w-20 z-10 opacity-50"
                        animate={{
                            y: [0, -15, 0],
                            rotate: [0, 10, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Image src="/images/football-pattern.png" alt="Football" width={60} height={60} className="rounded-full" />
                        </div>
                    </motion.div>
                </div>

                {/* Right Side Form with football styling */}
                <div className="w-full px-8 py-10 md:px-10 lg:w-2/5">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="flex justify-center mx-auto"
                    >
                        {/* Football logo instead of template logo */}
                        <div className="relative h-16 w-16">
                            <div className="w-16 h-16 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
                                <Image
                                    src="/images/football-pattern.png"
                                    alt="Football Logo"
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mt-5 text-2xl font-bold text-center text-gray-800 dark:text-white"
                    >
                        Welcome to Footex!
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mt-2 text-sm text-center text-gray-600 dark:text-gray-300"
                    >
                        Sign in to access your football experience
                    </motion.p>

                    {/* Error message with animation */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md text-sm"
                        >
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </motion.div>
                    )}

                    {/* Email Input with floating label */}
                    <div className="relative mt-6">
                        <input
                            id="LoggingEmailAddress"
                            className="peer w-full px-4 py-3 text-gray-700 bg-white/70 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all duration-200 placeholder-transparent dark:bg-gray-700/70 dark:text-gray-200 dark:border-gray-600"
                            type="email"
                            onKeyDown={handleKeyDown}
                            placeholder="Email Address"
                        />
                        <label
                            htmlFor="LoggingEmailAddress"
                            className="absolute left-4 -top-2.5 px-1 bg-white dark:bg-gray-800 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#4CAF50] dark:text-gray-300"
                        >
                            Email Address
                        </label>
                    </div>

                    {/* Password Input with floating label and toggle visibility */}
                    <div className="relative mt-6">
                        <input
                            id="loggingPassword"
                            className="peer w-full px-4 py-3 text-gray-700 bg-white/70 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all duration-200 placeholder-transparent dark:bg-gray-700/70 dark:text-gray-200 dark:border-gray-600"
                            type={showPassword ? "text" : "password"}
                            onKeyDown={handleKeyDown}
                            placeholder="Password"
                        />
                        <label
                            htmlFor="loggingPassword"
                            className="absolute left-4 -top-2.5 px-1 bg-white dark:bg-gray-800 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#4CAF50] dark:text-gray-300"
                        >
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Remember me checkbox and forgot password */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-[#4CAF50] focus:ring-[#4CAF50] border-gray-300 rounded"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-300">
                                Remember me
                            </label>
                        </div>
                        <Link href="/forgot-password" className="text-sm text-[#4CAF50] hover:text-[#3e8e41] dark:text-[#81c784] hover:underline transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Sign In Button with football theme */}
                    <motion.div
                        className="mt-6"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <button
                            className={`w-full px-6 py-3 text-sm font-medium text-white rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#4CAF50]/50 focus:ring-opacity-50 ${
                                isLoading 
                                    ? 'bg-gray-600 cursor-not-allowed opacity-80' 
                                    : 'bg-[#4CAF50] hover:bg-[#3e8e41] shadow-lg hover:shadow-[#4CAF50]/30'
                            }`}
                            onClick={handleSignIn}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </motion.div>

                    {/* Sign Up Link with animation */}
                    <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        <span className="text-sm text-gray-600 dark:text-gray-300">Don't have an account? </span>
                        <Link href="/register" className="text-sm font-medium text-[#4CAF50] hover:text-[#3e8e41] dark:text-[#81c784] hover:underline transition-colors">
                            Create an account
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
