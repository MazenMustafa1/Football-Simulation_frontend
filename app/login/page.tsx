'use client';

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import axios from 'axios';

const ModelViewer = dynamic(() => import("../Components/ModelViewer"), { ssr: false });

export default function SignIn() {
    const router = useRouter();

    const handleSignIn = async () => {
        const email = document.getElementById('LoggingEmailAddress').value;
        const password = document.getElementById('loggingPassword').value;

        try {
            const response = await axios.post('https://localhost:7082/api/auth/login', {
                email,
                password
            });

            if (response.status === 200) {
                // Save the token in local storage or context
                localStorage.setItem('token', response.data.token);
                // Redirect to the dashboard
                router.push('/dashboard');
            } else {
                // Handle login error
                console.error('Login failed:', response.data.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="flex w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 lg:max-w-4xl">
                {/* Left Side 3D Player (Sketchfab Embed) */}
                <div className="w-100 h-full"  style={{
                    backgroundImage: "url('/images/greenPitch.jpg')",
                    backgroundSize: 'cover',         // Ensures the image covers the div
                    backgroundPosition: 'center',    // Centers the image
                    backgroundRepeat: 'no-repeat',   // Prevents tiling
                }}
                >
                    <div>
                        <ModelViewer></ModelViewer>
                    </div>

                </div>


                {/* Right Side Form */}
                <div className="w-full px-6 py-8 md:px-8 lg:w-1/2">
                    <div className="flex justify-center mx-auto">
                        <img className="w-auto h-7 sm:h-8" src="https://merakiui.com/images/logo.svg" alt="Logo" />
                    </div>

                    <p className="mt-3 text-xl text-center text-gray-600 dark:text-gray-200">
                        Welcome back!
                    </p>

                    {/* Divider */}
                    <div className="flex items-center justify-between mt-4">
                        <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/4"></span>
                        <a href="#" className="text-xs text-center text-gray-500 uppercase dark:text-gray-400 hover:underline">
                            login with email
                        </a>
                        <span className="w-1/5 border-b dark:border-gray-400 lg:w-1/4"></span>
                    </div>

                    {/* Email Input */}
                    <div className="mt-4">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                            htmlFor="LoggingEmailAddress"
                        >
                            Email Address
                        </label>
                        <input
                            id="LoggingEmailAddress"
                            className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                            type="email"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mt-4">
                        <div className="flex justify-between">
                            <label
                                className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                                htmlFor="loggingPassword"
                            >
                                Password
                            </label>
                            <a href="#" className="text-xs text-gray-500 dark:text-gray-300 hover:underline">
                                Forget Password?
                            </a>
                        </div>

                        <input
                            id="loggingPassword"
                            className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                            type="password"
                        />
                    </div>

                    {/* Sign In Button */}
                    <div className="mt-6">
                        <button className="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50" onClick={handleSignIn}>
                            Sign In
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="flex items-center justify-between mt-4">
                        <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                        <Link href="/register" className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline">
                            or sign up
                        </Link>
                        <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
