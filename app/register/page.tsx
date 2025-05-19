"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import authService, { RegisterRequest } from "../../Services/AuthenticationService";
import Image from "next/image";

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "male",
        age: "",
        image: null as File | null
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        // Clear error when user types
        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: {[key: string]: string} = {};

        // Validate username
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        // Validate confirm password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Validate age (if provided)
        if (formData.age && (Number(formData.age) < 13 || Number(formData.age) > 120)) {
            newErrors.age = "Please enter a valid age between 13 and 120";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const registerData: RegisterRequest = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            };

            await authService.register(registerData);

            // Registration successful - redirect to login page
            router.push("/login?registered=true");
        } catch (error: any) {
            console.error("Registration error:", error);
            setServerError(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-200 py-6">
            <div className="flex w-full max-w-sm mx-auto overflow-hidden bg-white rounded-xl shadow-2xl dark:bg-gray-800 lg:max-w-4xl">
                {/* Left Side Image */}
                <div className="hidden bg-cover lg:block lg:w-1/2 relative">
                    <Image
                        src="/images/Stadium dark.png"
                        alt="Stadium"
                        fill
                        style={{ objectFit: "cover" }}
                        priority
                        className="absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 to-blue-900/70 flex items-center justify-center">
                        <div className="text-white text-center p-8">
                            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                            <p className="text-lg">Stay updated with the latest in football news, matches, and statistics.</p>
                            <div className="mt-6 flex justify-center">
                                <img src="/logos/barcelona.png" alt="Team Logo" className="h-16 w-auto mx-2" />
                                <img src="/logos/real madrid.png" alt="Team Logo" className="h-16 w-auto mx-2" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Form */}
                <div className="w-full px-6 py-6 md:px-8 lg:w-1/2 overflow-y-auto" style={{ maxHeight: '90vh' }}>
                    <div className="flex justify-center mx-auto">
                        <img className="w-auto h-14 sm:h-16" src="/logos/barcelona.png" alt="Logo" />
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-center text-gray-700 dark:text-gray-200">
                        Create Your Account
                    </h2>

                    <p className="mt-2 text-center text-gray-500 dark:text-gray-400">
                        Join the football community today
                    </p>

                    {serverError && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {serverError}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                        {/* Username Input */}
                        <div>
                            <label
                                className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                                htmlFor="username"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                className={`block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300 ${errors.username ? 'border-red-500' : ''}`}
                                type="text"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Your username"
                            />
                            {errors.username && (
                                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                            )}
                        </div>

                        {/* Email Input */}
                        <div>
                            <label
                                className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                                htmlFor="email"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                className={`block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300 ${errors.email ? 'border-red-500' : ''}`}
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your.email@example.com"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label
                                className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                                htmlFor="password"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                className={`block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300 ${errors.password ? 'border-red-500' : ''}`}
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label
                                className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                                htmlFor="confirmPassword"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                className={`block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Optional Fields Section */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Additional Information (Optional)
                            </h3>

                            {/* Image Upload */}
                            <div className="mb-4">
                                <label
                                    className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                                    htmlFor="image"
                                >
                                    Profile Image
                                </label>
                                <input
                                    id="image"
                                    className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* Gender Select */}
                            <div className="mb-4">
                                <label
                                    className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                                    htmlFor="gender"
                                >
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Age Input */}
                            <div>
                                <label
                                    className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                                    htmlFor="age"
                                >
                                    Age
                                </label>
                                <input
                                    id="age"
                                    className={`block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300 ${errors.age ? 'border-red-500' : ''}`}
                                    type="number"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    min="13"
                                    max="120"
                                    placeholder="Your age"
                                />
                                {errors.age && (
                                    <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                                )}
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-500'} rounded-lg focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 flex justify-center items-center`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </>
                            ) : "Create Account"}
                        </button>

                        {/* Sign In Link */}
                        <div className="flex items-center justify-between mt-4">
                            <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                            <Link href="/login" className="text-sm text-blue-500 hover:underline font-medium">
                                Already have an account? Sign In
                            </Link>
                            <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
