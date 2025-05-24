'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import authService from '../../Services/AuthenticationService';
import { motion } from 'framer-motion';
import Image from 'next/image';

const ModelViewer = dynamic(() => import('../Components/ModelViewer'), {
  ssr: false,
});

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    const email =
      (
        document.getElementById(
          'LoggingEmailAddress'
        ) as HTMLInputElement | null
      )?.value || '';
    const password =
      (document.getElementById('loggingPassword') as HTMLInputElement | null)
        ?.value || '';

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.login({
        email,
        password,
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
    <div className="flex min-h-screen items-center justify-center bg-[#4CAF50]">
      {/* Stadium background with better opacity and overlay */}
      <div className="bg-[url('/images/Stadium dark.png')] absolute inset-0 bg-cover bg-center opacity-30"></div>
      {/* Football pattern overlay */}
      <div className="absolute inset-0 bg-[url('/images/football-pattern.png')] bg-repeat opacity-5"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto flex w-full max-w-sm overflow-hidden rounded-2xl bg-white/90 shadow-2xl backdrop-blur-sm lg:max-w-5xl dark:bg-gray-900/90"
      >
        {/* Left Side 3D Player with enhanced styling */}
        <div className="relative h-full w-0 overflow-hidden rounded-l-2xl lg:w-3/5">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#4CAF50]/80 via-[#4CAF50]/40 to-transparent"></div>

          <div className="relative h-full w-full">
            <ModelViewer />
          </div>

          {/* Football branding overlay with larger text */}
          <div className="absolute bottom-10 left-10 z-20 text-white">
            <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-shadow-lg">
              FOOTEX
            </h2>
            <p className="max-w-xs font-medium text-white/80 text-shadow-sm">
              Experience the beautiful game like never before.
            </p>
          </div>

          {/* Floating footballs animation */}
          <motion.div
            className="absolute top-20 right-20 z-10 h-20 w-20 opacity-50"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Image
                src="/images/football-pattern.png"
                alt="Football"
                width={60}
                height={60}
                className="rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Right Side Form with football styling */}
        <div className="w-full px-8 py-10 md:px-10 lg:w-2/5">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mx-auto flex justify-center"
          >
            {/* Football logo instead of template logo */}
            <div className="relative h-16 w-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]/10">
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
            className="mt-5 text-center text-2xl font-bold text-gray-800 dark:text-white"
          >
            Welcome to Footex!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300"
          >
            Sign in to access your football experience
          </motion.p>

          {/* Error message with animation */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-md border-l-4 border-red-500 bg-red-100 p-3 text-sm text-red-700"
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </motion.div>
          )}

          {/* Email Input with floating label */}
          <div className="relative mt-6">
            <input
              id="LoggingEmailAddress"
              className="peer w-full rounded-lg border border-gray-300 bg-white/70 px-4 py-3 text-gray-700 placeholder-transparent transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#4CAF50] focus:outline-none dark:border-gray-600 dark:bg-gray-700/70 dark:text-gray-200"
              type="email"
              onKeyDown={handleKeyDown}
              placeholder="Email Address"
            />
            <label
              htmlFor="LoggingEmailAddress"
              className="absolute -top-2.5 left-4 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#4CAF50] dark:bg-gray-800 dark:text-gray-300"
            >
              Email Address
            </label>
          </div>

          {/* Password Input with floating label and toggle visibility */}
          <div className="relative mt-6">
            <input
              id="loggingPassword"
              className="peer w-full rounded-lg border border-gray-300 bg-white/70 px-4 py-3 text-gray-700 placeholder-transparent transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#4CAF50] focus:outline-none dark:border-gray-600 dark:bg-gray-700/70 dark:text-gray-200"
              type={showPassword ? 'text' : 'password'}
              onKeyDown={handleKeyDown}
              placeholder="Password"
            />
            <label
              htmlFor="loggingPassword"
              className="absolute -top-2.5 left-4 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#4CAF50] dark:bg-gray-800 dark:text-gray-300"
            >
              Password
            </label>
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Remember me checkbox and forgot password */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50]"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-600 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-[#4CAF50] transition-colors hover:text-[#3e8e41] hover:underline dark:text-[#81c784]"
            >
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
              className={`focus:ring-opacity-50 w-full rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-300 focus:ring-4 focus:ring-[#4CAF50]/50 focus:outline-none ${
                isLoading
                  ? 'cursor-not-allowed bg-gray-600 opacity-80'
                  : 'bg-[#4CAF50] shadow-lg hover:bg-[#3e8e41] hover:shadow-[#4CAF50]/30'
              }`}
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
            </span>
            <Link
              href="/register"
              className="text-sm font-medium text-[#4CAF50] transition-colors hover:text-[#3e8e41] hover:underline dark:text-[#81c784]"
            >
              Create an account
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
