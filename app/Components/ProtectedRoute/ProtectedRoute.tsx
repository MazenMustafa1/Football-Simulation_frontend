import React from 'react';
import { useRouter } from 'next/router';

const ProtectedRoute = ({ children, roles }) => {
    const router = useRouter();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

    if (!token) {
        router.push('/login');
        return null;
    }

    if (roles && !roles.includes(userRole)) {
        router.push('/unauthorized');
        return null;
    }

    return children;
};

export default ProtectedRoute;
