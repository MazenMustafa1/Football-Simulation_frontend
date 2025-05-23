"use client";

import Link from "next/link";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import authService, {RegisterRequest} from "../../Services/AuthenticationService";
import teamService, {Team} from "../../Services/TeamService";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "",
        age: 0,
        image: null as File | null,
        phoneNumber: "",
        FavoriteTeamId: null as number | null // Ensure FavoriteTeamId can be null or number
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        fetchTeams().then();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await teamService.getAllTeams();
            if (Array.isArray(response)) {
                setTeams(response);
            } else {
                console.error('Unexpected API response format for teams:', response);
                setTeams([]);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            setTeams([]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {id, value} = e.target;
        // For FavoriteTeamId, parse the value to a number if it's not an empty string
        const processedValue = id === 'FavoriteTeamId' ? (value === "" ? null : Number(value)) : value;
        setFormData(prev => ({...prev, [id]: processedValue}));

        if (errors[id]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({...prev, image: e.target.files?.[0] || null}));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "FirstName is required";
        } else if (formData.firstName.length < 3) {
            newErrors.firstName = "FirstName must be at least 3 characters";
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = "LastName is required";
        } else if (formData.lastName.length < 2) { // Corrected to check lastName length
            newErrors.lastName = "LastName must be at least 2 characters";
        }
        if (!formData.userName.trim()) {
            newErrors.firstName = "userName is required";
        } else if (formData.userName.length < 4) {
            newErrors.firstName = "FirstName must be at least 4 characters";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (formData.age && (Number(formData.age) < 13 || Number(formData.age) > 120)) {
            newErrors.age = "Please enter a valid age between 13 and 120";
        }

        const phoneNumberRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        // Only validate if a phone number is entered, as it's optional
        if (formData.phoneNumber && !phoneNumberRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Please enter a valid phone number";
        }
        // No specific validation for FavoriteTeamId here, but you could add one if needed

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
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
                FirstName: formData.firstName,
                LastName: formData.lastName,
                Username: formData.userName,
                Email: formData.email,
                Password: formData.password,
                confirmPassword: formData.confirmPassword,
                Image: formData.image,
                Gender: formData.gender,
                Age: formData.age > 0 ? formData.age : null, // Send age only if provided
                PhoneNumber: formData.phoneNumber || undefined, // Send phone only if provided
                FavoriteTeamId: formData.FavoriteTeamId // This will be null or a number
            };

            const response = await authService.register(registerData);
            if (response.succeeded) {
                router.push("/login?registered=true");
            } else {
                setServerError(response.error || "Registration failed. Please try again.");
            }
        } catch (error: any) {
            console.error("Registration error:", error);
            setServerError(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen py-6 relative">
            {/* Dynamic football-themed background */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden -z-10 bg-[url('/images/football-pattern.png')] bg-cover bg-center opacity-10">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-green-800/90 via-blue-900/80 to-indigo-900/90"></div>
            </div>

            <div
                className="flex w-full max-w-sm mx-auto overflow-hidden rounded-xl shadow-2xl bg-white/95 dark:bg-gray-800/95 lg:max-w-4xl border-t border-green-400/30">
                {/* Left Side Image with enhanced styling */}
                <div className="hidden bg-cover lg:block lg:w-1/2 relative">
                    <div className="absolute inset-0 bg-[url('/images/Messi%20shooting.png')] bg-cover bg-center"></div>
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-green-800/80 via-emerald-800/70 to-blue-900/80 flex items-center justify-center">
                        <div className="text-white text-center p-8">
                            <h2 className="text-3xl font-bold mb-4 text-shadow">Join the Football Community</h2>
                            <p className="text-lg">Get access to exclusive features:</p>
                            <ul className="mt-4 space-y-2 text-left list-none">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                              clipRule="evenodd"></path>
                                    </svg>
                                    Personalized match updates
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                              clipRule="evenodd"></path>
                                    </svg>
                                    Track your favorite teams
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                              clipRule="evenodd"></path>
                                    </svg>
                                    Join fan discussions
                                </li>
                            </ul>
                            <div className="mt-8 flex justify-center space-x-4 items-center">
                                <img src="/logos/barcelona.png" alt="Team Logo" className="h-14 w-auto animate-pulse"/>
                                <img src="/logos/real madrid.png" alt="Team Logo" className="h-14 w-auto animate-pulse"
                                     style={{animationDelay: "0.5s"}}/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Form with enhanced styling */}
                <div className="w-full px-6 py-6 md:px-8 lg:w-1/2 overflow-y-auto" style={{maxHeight: '90vh'}}>
                    <div className="flex justify-center mx-auto">
                        <div className="text-center flex items-center">
                            <img
                                src="/logos/Footex.png"
                                alt="Footex Logo"
                                className="w-10 h-10 object-contain mr-2"
                            />
                            <div>
                                <h1 className="font-bold text-2xl text-green-600 dark:text-green-500">FOOTEX</h1>
                                <div
                                    className="w-16 h-1 bg-gradient-to-r from-blue-600 to-green-500 mx-auto rounded-full mt-1"></div>
                            </div>
                        </div>
                    </div>

                    <h2 className="mt-6 text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
                        Create Your Account
                    </h2>

                    <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
                        Be part of the action. Join today!
                    </p>

                    {serverError && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20"
                                     fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                          clipRule="evenodd"/>
                                </svg>
                                {serverError}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        {/* FirstName Input */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                   htmlFor="firstName">FirstName</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </div>
                                <input id="firstName"
                                       className={`block w-full pl-10 pr-4 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-opacity-40 dark:focus:border-green-500 focus:outline-none focus:ring focus:ring-green-300 ${errors.firstName ? 'border-red-500' : ''}`}
                                       type="text" value={formData.firstName} onChange={handleInputChange}
                                       placeholder="Your FirstName"/>
                            </div>
                            {errors.firstName && (<p className="text-red-500 text-xs mt-1">{errors.firstName}</p>)}
                        </div>
                        {/* LastName Input */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                   htmlFor="lastName">LastName</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </div>
                                <input id="lastName"
                                       className={`block w-full pl-10 pr-4 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-opacity-40 dark:focus:border-green-500 focus:outline-none focus:ring focus:ring-green-300 ${errors.lastName ? 'border-red-500' : ''}`}
                                       type="text" value={formData.lastName} onChange={handleInputChange}
                                       placeholder="Your LastName"/>
                            </div>
                            {errors.lastName && (<p className="text-red-500 text-xs mt-1">{errors.lastName}</p>)}
                        </div>
                        {/* UserName Input */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                   htmlFor="userName">UserName</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </div>
                                <input id="userName"
                                       className={`block w-full pl-10 pr-4 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-opacity-40 dark:focus:border-green-500 focus:outline-none focus:ring focus:ring-green-300 ${errors.userName ? 'border-red-500' : ''}`}
                                       type="text" value={formData.userName} onChange={handleInputChange}
                                       placeholder="Your UserName"/>
                            </div>
                            {errors.userName && (<p className="text-red-500 text-xs mt-1">{errors.userName}</p>)}
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                   htmlFor="email">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <input id="email"
                                       className={`block w-full pl-10 pr-4 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-opacity-40 dark:focus:border-green-500 focus:outline-none focus:ring focus:ring-green-300 ${errors.email ? 'border-red-500' : ''}`}
                                       type="email" value={formData.email} onChange={handleInputChange}
                                       placeholder="Your email address"/>
                            </div>
                            {errors.email && (<p className="text-red-500 text-xs mt-1">{errors.email}</p>)}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                   htmlFor="password">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                                <input id="password"
                                       className={`block w-full pl-10 pr-12 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-opacity-40 dark:focus:border-green-500 focus:outline-none focus:ring focus:ring-green-300 ${errors.password ? 'border-red-500' : ''}`}
                                       type={showPassword ? "text" : "password"} value={formData.password}
                                       onChange={handleInputChange} placeholder="Create a secure password"/>
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={togglePasswordVisibility}>
                                    {showPassword ? (
                                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                                        </svg>) : (
                                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>)}
                                </button>
                            </div>
                            {errors.password && (<p className="text-red-500 text-xs mt-1">{errors.password}</p>)}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                   htmlFor="confirmPassword">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                                <input id="confirmPassword"
                                       className={`block w-full pl-10 pr-12 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-opacity-40 dark:focus:border-green-500 focus:outline-none focus:ring focus:ring-green-300 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                       type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword}
                                       onChange={handleInputChange} placeholder="Confirm your password"/>
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={toggleConfirmPasswordVisibility}>
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                                        </svg>) : (
                                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none"
                                             stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>)}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>)}
                        </div>

                        {/* Optional Fields Section */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-500" fill="currentColor"
                                         viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                              clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <h3 className="ml-2 text-lg font-medium text-gray-700 dark:text-gray-300">Additional
                                    Information</h3>
                            </div>
                            <div
                                className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4"> {/* Added space-y-4 for consistent spacing */}

                                {/* Profile Image Upload */}
                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                           htmlFor="image">Profile Image</label>
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            {formData.image ? (
                                                <img src={URL.createObjectURL(formData.image)} alt="Profile preview"
                                                     className="w-full h-full object-cover"/>) : (
                                                <svg className="w-10 h-10 text-gray-400" fill="none"
                                                     stroke="currentColor" viewBox="0 0 24 24"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                </svg>)}
                                        </div>
                                        <div className="flex-1">
                                            <input id="image"
                                                   className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:outline-none"
                                                   type="file" accept="image/*" onChange={handleFileChange}/>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF
                                                (Max. 2MB)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Gender Select */}
                                <div> {/* Removed mb-4 as space-y-4 on parent handles it */}
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                           htmlFor="gender">Gender</label>
                                    <div className="relative">
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                        </div>
                                        <select id="gender"
                                                className="block w-full pl-10 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-500 focus:outline-none focus:ring focus:ring-green-300 focus:ring-opacity-40"
                                                value={formData.gender} onChange={handleInputChange}>
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Favorite Team Select */}
                                <div>
                                    <label
                                        className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                        htmlFor="FavoriteTeamId"
                                    >
                                        Favorite Team
                                    </label>
                                    <div className="relative">
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {/* You can use a football or team related icon here */}
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                {/* Example icon, change as needed */}
                                            </svg>
                                        </div>
                                        <select
                                            id="FavoriteTeamId"
                                            className="block w-full pl-10 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-500 focus:outline-none focus:ring focus:ring-green-300 focus:ring-opacity-40"
                                            value={formData.FavoriteTeamId === null ? "" : formData.FavoriteTeamId} // Handle null for default option
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select your favorite team</option>
                                            {teams.map((team) => (
                                                <option key={team.id} value={team.id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* You can add error display for FavoriteTeamId if needed */}
                                    {/* {errors.FavoriteTeamId && (<p className="text-red-500 text-xs mt-1">{errors.FavoriteTeamId}</p>)} */}
                                </div>


                                {/* Phone Number Input */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                           htmlFor="phoneNumber">Phone Number</label>
                                    <PhoneInput
                                        country={'us'}
                                        value={formData.phoneNumber}
                                        onChange={(phone) => {
                                            setFormData(prev => ({...prev, phoneNumber: phone}));
                                            if (errors.phoneNumber) {
                                                setErrors(prev => {
                                                    const newErrors = {...prev};
                                                    delete newErrors.phoneNumber;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        inputProps={{
                                            name: 'phoneNumber',
                                            id: 'phoneNumber'
                                        }} // Removed required: true to make it optional
                                        containerClass="w-full"
                                        inputClass={`!w-full block pr-4 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-opacity-40 dark:focus:border-green-500 focus:outline-none focus:ring focus:ring-green-300 ${errors.phoneNumber ? '!border-red-500' : ''}`}
                                        buttonClass="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                                        dropdownClass="dark:bg-gray-700 dark:text-gray-200"
                                        searchClass="dark:bg-gray-800 dark:text-gray-200"
                                    />
                                    {errors.phoneNumber && (
                                        <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>)}
                                </div>

                                {/* Age Input */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                           htmlFor="age">Age</label>
                                    <div className="relative">
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                        </div>
                                        <input id="age"
                                               className={`block w-full pl-10 pr-4 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-opacity-40 dark:focus:border-green-500 focus:outline-none focus:ring focus:ring-green-300 ${errors.age ? 'border-red-500' : ''}`}
                                               type="number" value={formData.age === 0 ? "" : formData.age}
                                               onChange={handleInputChange} min="13" max="120" placeholder="Your age"/>
                                    </div>
                                    {errors.age && (<p className="text-red-500 text-xs mt-1">{errors.age}</p>)}
                                </div>
                            </div>
                        </div>

                        {/* Register Button */}
                        <button type="submit" disabled={isLoading}
                                className={`w-full px-6 py-3 mt-4 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform rounded-lg focus:outline-none focus:ring focus:ring-green-300 focus:ring-opacity-50 flex justify-center items-center ${isLoading ? 'bg-gray-500' : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'}`}>
                            {isLoading ? (<>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Creating Your Account...</>) : (<>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                Join the League</>)}
                        </button>

                        {/* Sign In Link */}
                        <div className="flex items-center justify-center mt-6">
                            <div
                                className="w-1/5 md:w-1/4 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600 rounded"></div>
                            <Link href="/login"
                                  className="relative px-4 py-2 mx-3 text-sm font-medium text-green-600 transition-all duration-300 group dark:text-green-400 hover:text-white">
                                <span
                                    className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-green-600 to-blue-600 group-hover:skew-x-12 opacity-0 group-hover:opacity-100 rounded-lg"></span>
                                <span className="relative flex items-center justify-center">
      <svg className="w-4 h-4 mr-2 transition-transform duration-300 transform group-hover:rotate-12" fill="none"
           stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
      </svg>
      Already in the team? Sign In
    </span>
                            </Link>
                            <div
                                className="w-1/5 md:w-1/4 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600 rounded"></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}