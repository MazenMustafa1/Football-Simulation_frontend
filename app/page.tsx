'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Hero from "@/app/Components/Hero Section/Hero";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/firstpage');
  }, [router]);

  return (
      <div>
        <Hero></Hero>
      </div>
  );
}
