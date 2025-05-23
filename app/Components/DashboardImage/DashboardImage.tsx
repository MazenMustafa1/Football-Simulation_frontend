'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function DashboardImage() {
    const [imageIndex, setImageIndex] = useState(0);
    const images = [
        '/images/Stadium dark.png',
        '/images/Messi shooting.png',
        '/images/greenPitch.jpg'
    ];

    const titles = [
        'Welcome to Footex',
        'Track Your Favorite Teams',
        'Stay Updated with Live Matches'
    ];

    const subtitles = [
        'Your Ultimate Football Experience',
        'Follow Players, Teams and Leagues',
        'Real-time Stats and Analysis'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[270px] rounded-xl overflow-hidden shadow-lg mb-8">
            {/* Main Image */}
            <div className="relative w-full h-full">
                <Image
                    src={images[imageIndex]}
                    alt="Football"
                    fill
                    priority
                    className="object-cover transition-opacity duration-1000"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>

                {/* Text Content */}
                <div className="absolute inset-0 flex flex-col justify-center p-8 z-20 text-white">
                    <h1 className="text-3xl font-bold mb-2 animate-fadeIn">{titles[imageIndex]}</h1>
                    <p className="text-lg opacity-80 animate-fadeIn">{subtitles[imageIndex]}</p>
                </div>

                {/* Indicator Dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setImageIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === imageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
