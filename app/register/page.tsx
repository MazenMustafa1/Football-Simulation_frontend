import Link from "next/link";

export default function Register() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="flex w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 lg:max-w-4xl">
                {/* Left Side Image */}
                <div
                    className="hidden bg-cover lg:block lg:w-1/2"
                    style={{
                        backgroundImage: `url('images/Stadium dark.png')`,
                    }}
                ></div>

                {/* Right Side Form */}
                <div className="w-full px-6 py-8 md:px-8 lg:w-1/2">
                    <div className="flex justify-center mx-auto">
                        <img className="w-auto h-7 sm:h-8" src="https://merakiui.com/images/logo.svg" alt="Logo" />
                    </div>

                    <p className="mt-3 text-xl text-center text-gray-600 dark:text-gray-200">
                        Create an Account
                    </p>

                    {/* Divider */}
                    <div className="flex items-center justify-between mt-4">
                        <span className="w-1/5 border-b dark:border-gray-600 lg:w-1/4"></span>
                        <a href="#" className="text-xs text-center text-gray-500 uppercase dark:text-gray-400 hover:underline">
                            Register with email
                        </a>
                        <span className="w-1/5 border-b dark:border-gray-400 lg:w-1/4"></span>
                    </div>

                    {/* Username Input */}
                    <div className="mt-4">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                            htmlFor="username"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                            type="text"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="mt-4">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                            htmlFor="email"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                            type="email"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mt-4">
                        <div className="flex justify-between">
                            <label
                                className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                                htmlFor="password"
                            >
                                Password
                            </label>
                        </div>

                        <input
                            id="password"
                            className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                            type="password"
                        />
                    </div>

                    {/* Confirm Password Input */}
                    <div className="mt-4">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                            htmlFor="confirmPassword"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                            type="password"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="mt-4">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                            htmlFor="image"
                        >
                            Profile Image
                        </label>
                        <input
                            id="image"
                            className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                            type="file"
                        />
                    </div>

                    {/* Gender Select */}
                    <div className="mt-4">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                            htmlFor="gender"
                        >
                            Gender
                        </label>
                        <select
                            id="gender"
                            className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Age Input */}
                    <div className="mt-4">
                        <label
                            className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200"
                            htmlFor="age"
                        >
                            Age
                        </label>
                        <input
                            id="age"
                            className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
                            type="number"
                        />
                    </div>

                    {/* Register Button */}
                    <div className="mt-6">
                        <button className="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50">
                            Register
                        </button>
                    </div>

                    {/* Sign In Link */}
                    <div className="flex items-center justify-between mt-4">
                        <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                        <Link href="/login" className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline">
                            Have an account? Sign In
                        </Link>
                        <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4"></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
