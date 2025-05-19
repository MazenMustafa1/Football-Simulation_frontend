'use client'

import SigninNavbar from "@/app/Components/Navbar/SigninNavbar";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Hero() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleGetStarted = () => {
        router.push('/login');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }
    };

    return (
        <div
            className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden"
            style={{
                backgroundImage: "url('/images/Stadium dark.png')",
            }}
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>

            {/* Animated pattern */}
            <div className="absolute inset-0 bg-[url('/images/football-pattern.png')] bg-repeat opacity-5"></div>

            {/* Navbar at the top */}
            <div className="w-full absolute top-0 left-0 z-10">
               <SigninNavbar />
            </div>

            {/* Hero Content */}
            <div className="relative z-[1] flex items-center justify-center h-screen px-4 md:px-6">
                <motion.div
                    className="text-center max-w-5xl mx-auto"
                    initial="hidden"
                    animate={isLoaded ? "visible" : "hidden"}
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants}>
                        <h1 className="mb-6 text-4xl md:text-6xl font-extrabold text-white leading-tight">
                            Experience Football Like <span className="text-primary bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Never Before</span>
                        </h1>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <p className="mb-8 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
                            Dive into realistic football simulations powered by advanced AI. Generate full match events, stats, and outcomes —
                            just like watching the real game unfold.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            className="btn btn-primary px-8 py-3 text-lg font-medium rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
                            onClick={handleGetStarted}
                        >
                            Get Started
                        </button>
                        <Link href="/trial">
                            <button
                                className="btn btn-outline btn-secondary px-8 py-3 text-lg font-medium rounded-lg transition-all transform hover:scale-105"
                            >
                                Try Demo
                            </button>
                        </Link>
                    </motion.div>

                    {/* Feature highlights */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-center"
                    >
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-all">
                            <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">AI-Powered Matches</h3>
                            <p className="text-gray-300">State-of-the-art AI generates realistic match simulations based on real player data.</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-all">
                            <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Detailed Statistics</h3>
                            <p className="text-gray-300">Access comprehensive match statistics, player performance data, and tactical analysis.</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-all">
                            <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Customizable Matches</h3>
                            <p className="text-gray-300">Create your own match scenarios with custom teams, players, and game conditions.</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom floating element */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center opacity-80 z-10">
                <div className="text-white text-sm flex items-center gap-2">
                    <span>Scroll to explore</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
