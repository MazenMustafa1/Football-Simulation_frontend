'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}
interface LoggedUser
{
    accessToken: string;
    roles: string[];
    username: string;
    userId: string;
    email: string;
    tokenExpires : string;
    refreshToken: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        // Check authentication on the client side
        const user : LoggedUser = JSON.parse(localStorage.getItem('user') || '') || null;

        if (!user.accessToken) {
            router.push('/login');
            return;
        }

        if (allowedRoles && !allowedRoles.includes(user.roles[0] || '')) {
            router.push('/unauthorized');
            return;
        }

        setIsAuthorized(true);
    }, [router, pathname, allowedRoles]);

    // Show nothing while checking authorization
    if (isAuthorized === null) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // Only render children if authorized
    return isAuthorized ? <>{children}</> : null;
};

export default ProtectedRoute;
