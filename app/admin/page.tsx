'use client';

import React from 'react';
import AdminDashboard from '../Components/AdminDashboard/AdminDashboard';
import ProtectedRoute from '../Components/ProtectedRoute/ProtectedRoute';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Background decorative elements */}
        <div className="absolute top-40 left-10 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto py-10 px-4 sm:px-6 relative z-10"
        >
          <AdminDashboard />

          {/* Footer section */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 text-center text-gray-400 text-sm"
          >
            <p>© {new Date().getFullYear()} Footex Admin Dashboard. All rights reserved.</p>
          </motion.footer>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
