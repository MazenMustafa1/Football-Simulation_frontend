'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Trash2,
  X,
  CheckCheck,
  Filter,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Zap,
  Target,
  Play,
  Home,
  ClubIcon,
  Users,
  Package,
  Settings,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '@/Services/AuthenticationService';
import notificationService, {
  Notification,
  NotificationType,
} from '@/Services/NotificationService';
import { NotificationData } from '@/Services/SignalRService';
import ProtectedRoute from '@/app/Components/ProtectedRoute/ProtectedRoute';
import Sidebar, { SidebarLayout } from '@/app/Components/Sidebar/Sidebar';
import { SidebarItem } from '@/app/Components/Sidebar/SidebarItem';
import { SidebarSection } from '@/app/Components/Sidebar/SidebarSection';
import Navbar from '@/app/Components/Navbar/Navbar';
import useSignalRNotifications from '@/app/hooks/useSignalRNotifications';
import { useSettings } from '@/app/contexts/EnhancedSettingsContext';
interface FilterOptions {
  type?: NotificationType;
  read?: boolean;
  dateRange?: 'today' | 'week' | 'month' | 'all';
}

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOptions>({ dateRange: 'all' });
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const itemsPerPage = 20;

  // Get dark mode from Enhanced Settings Context
  const { isDarkMode } = useSettings();

  // Handle client-side mounting to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Setup SignalR notifications with custom handling
  const { isConnected, connectionStats } = useSignalRNotifications({
    autoConnect: true,
    showToasts: true,
    autoRedirect: false, // We'll handle navigation manually
    onNotification: (notification: NotificationData) => {
      // Handle case mismatch - the actual object has capitalized properties
      const title = (notification as any).Title || notification.title;
      const content = (notification as any).Content || notification.content;
      const time = (notification as any).Time || notification.time;

      // Convert SignalR notification to our format and add to state
      const newNotification: Notification = {
        id: notification.id,
        userId: notification.userId,
        content: content,
        title: title,
        type: notification.type as NotificationType,
        time: time,
        isRead: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    onMatchStart: (data: NotificationData, simulationId: string) => {
      // Handle case mismatch - the actual object has capitalized properties
      const content =
        (data as any).Content || data.content || 'Match has started';
      const time = (data as any).Time || data.time;

      const newNotification: Notification = {
        id: data.id,
        userId: data.userId,
        content: content,
        title: 'Match Started',
        type: NotificationType.MatchStart,
        time: time,
        isRead: false,
        simulationId: simulationId,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    onMatchEnd: (data: NotificationData, simulationId: string) => {
      const newNotification: Notification = {
        id: data.id,
        userId: data.userId,
        content: data.content || 'Match has ended',
        title: 'Match Ended',
        type: NotificationType.MatchEnd,
        time: data.time,
        isRead: false,
        simulationId: simulationId,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    onSimulationUpdate: (data: NotificationData, simulationId: string) => {
      const newNotification: Notification = {
        id: data.id,
        userId: data.userId,
        content: data.content || 'Simulation update available',
        title: 'Simulation Update',
        type: NotificationType.SimulationUpdate,
        time: data.time,
        isRead: false,
        simulationId: simulationId,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
  });

  useEffect(() => {
    if (authService.isAuthenticated()) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      router.push('/login');
    }
  }, [router, currentPage]);

  useEffect(() => {
    // Apply filters whenever notifications, search query, or filter options change
    applyFilters();
  }, [notifications, searchQuery, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getUserNotifications(
        currentPage,
        itemsPerPage
      );

      if (currentPage === 1) {
        setNotifications(result.notifications);
      } else {
        setNotifications((prev) => [...prev, ...result.notifications]);
      }

      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notification) =>
          notification.content.toLowerCase().includes(query) ||
          (notification.title &&
            notification.title.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filter.type) {
      filtered = filtered.filter(
        (notification) => notification.type === filter.type
      );
    }

    // Apply read status filter
    if (filter.read !== undefined) {
      filtered = filtered.filter(
        (notification) => notification.isRead === filter.read
      );
    }

    // Apply date range filter
    if (filter.dateRange && filter.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filter.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(
        (notification) => new Date(notification.time) >= filterDate
      );
    }

    setFilteredNotifications(filtered);
  };

  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = 'h-5 w-5';
    switch (type) {
      case NotificationType.MatchStart:
        return <Target className={`${iconClass} text-blue-500`} />;
      case NotificationType.MatchEnd:
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case NotificationType.SimulationStart:
        return <Play className={`${iconClass} text-purple-500`} />;
      case NotificationType.SimulationEnd:
        return <CheckCircle className={`${iconClass} text-purple-500`} />;
      case NotificationType.Success:
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case NotificationType.Error:
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case NotificationType.Warning:
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case NotificationType.SystemAlert:
        return <Zap className={`${iconClass} text-orange-500`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const getNotificationTypeColor = (type: NotificationType) => {
    const baseClasses =
      isMounted && isDarkMode
        ? {
            matchStart: 'bg-blue-900/50 text-blue-300 border-blue-700',
            matchEnd: 'bg-blue-900/50 text-blue-300 border-blue-700',
            simulationStart:
              'bg-purple-900/50 text-purple-300 border-purple-700',
            simulationEnd: 'bg-purple-900/50 text-purple-300 border-purple-700',
            success: 'bg-green-900/50 text-green-300 border-green-700',
            error: 'bg-red-900/50 text-red-300 border-red-700',
            warning: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
            systemAlert: 'bg-orange-900/50 text-orange-300 border-orange-700',
            default: 'bg-gray-700/50 text-gray-300 border-gray-600',
          }
        : {
            matchStart: 'bg-blue-100 text-blue-800 border-blue-200',
            matchEnd: 'bg-blue-100 text-blue-800 border-blue-200',
            simulationStart: 'bg-purple-100 text-purple-800 border-purple-200',
            simulationEnd: 'bg-purple-100 text-purple-800 border-purple-200',
            success: 'bg-green-100 text-green-800 border-green-200',
            error: 'bg-red-100 text-red-800 border-red-200',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            systemAlert: 'bg-orange-100 text-orange-800 border-orange-200',
            default: 'bg-gray-100 text-gray-800 border-gray-200',
          };

    switch (type) {
      case NotificationType.MatchStart:
      case NotificationType.MatchEnd:
        return baseClasses.matchStart;
      case NotificationType.SimulationStart:
      case NotificationType.SimulationEnd:
        return baseClasses.simulationStart;
      case NotificationType.Success:
        return baseClasses.success;
      case NotificationType.Error:
        return baseClasses.error;
      case NotificationType.Warning:
        return baseClasses.warning;
      case NotificationType.SystemAlert:
        return baseClasses.systemAlert;
      default:
        return baseClasses.default;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      const success = await notificationService.markAllAsRead();
      if (success) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const success =
        await notificationService.deleteNotification(notificationId);
      if (success) {
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const deleteSelectedNotifications = async () => {
    if (selectedNotifications.size === 0) return;

    try {
      setIsLoading(true);
      const deletePromises = Array.from(selectedNotifications).map((id) =>
        notificationService.deleteNotification(id)
      );

      await Promise.all(deletePromises);

      const deletedUnreadCount = notifications.filter(
        (n) => selectedNotifications.has(n.id) && !n.isRead
      ).length;

      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.has(n.id))
      );
      setUnreadCount((prev) => Math.max(0, prev - deletedUnreadCount));
      setSelectedNotifications(new Set());

      toast.success(`${selectedNotifications.size} notifications deleted`);
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast.error('Failed to delete selected notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllNotifications = async () => {
    if (
      !confirm(
        'Are you sure you want to delete ALL notifications? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      const success = await notificationService.deleteAllNotifications();
      if (success) {
        setNotifications([]);
        setUnreadCount(0);
        setSelectedNotifications(new Set());
        toast.success('All notifications cleared');
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      toast.error('Failed to clear notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Handle special notification types that require navigation
    if (
      notification.type === NotificationType.MatchStart &&
      notification.simulationId
    ) {
      router.push(`/simulationview/${notification.simulationId}`);
    }
  };

  const resetFilters = () => {
    setFilter({ dateRange: 'all' });
    setSearchQuery('');
  };

  if (loading && currentPage === 1) {
    return (
      <ProtectedRoute allowedRoles={['User', 'Admin', 'Coach', 'Player']}>
        <div
          className={`flex min-h-screen transition-colors duration-300 ${
            isMounted && isDarkMode
              ? 'bg-gray-900'
              : 'bg-gradient-to-br from-gray-50 to-gray-100'
          }`}
          suppressHydrationWarning
        >
          <SidebarLayout
            sidebar={
              <>
                <SidebarItem
                  icon={<Home />}
                  text="Dashboard"
                  href="/dashboard"
                />
                <SidebarItem icon={<ClubIcon />} text="Teams" href="/teams" />
                <SidebarItem icon={<Users />} text="Players" href="/players" />
                <SidebarItem
                  icon={<Package />}
                  text="Seasons"
                  href="/seasons"
                />
                <SidebarItem
                  icon={<Bell />}
                  text="Notifications"
                  href="/notifications"
                  active
                />
                <SidebarItem icon={<Search />} text="Search" href="/search" />
                <SidebarItem
                  icon={<Settings />}
                  text="Settings"
                  href="/settings"
                />
                <SidebarItem icon={<User />} text="Profile" href="/profile" />
              </>
            }
          >
            <Navbar />
            <div className="flex flex-1 items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div
                  className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full shadow-lg ${
                    isMounted && isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div
                    className={`h-8 w-8 animate-spin rounded-full border-3 border-t-transparent ${
                      isMounted && isDarkMode
                        ? 'border-blue-400'
                        : 'border-blue-500'
                    }`}
                  ></div>
                </div>
                <h2
                  className={`mb-3 text-2xl font-bold ${
                    isMounted && isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Loading Notifications
                </h2>
                <p
                  className={`max-w-md ${
                    isMounted && isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Please wait while we fetch your latest notifications and
                  updates...
                </p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  className={`mx-auto mt-4 h-1 max-w-xs rounded-full ${
                    isMounted && isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                  }`}
                />
              </motion.div>
            </div>
          </SidebarLayout>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['User', 'Admin', 'Coach', 'Player']}>
      <div
        className={`flex min-h-screen transition-colors duration-300 ${
          isMounted && isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}
        suppressHydrationWarning
      >
        <SidebarLayout
          sidebar={
            <>
              <SidebarItem icon={<Home />} text="Dashboard" href="/dashboard" />
              <SidebarItem icon={<ClubIcon />} text="Teams" href="/teams" />
              <SidebarItem icon={<Users />} text="Players" href="/players" />
              <SidebarItem icon={<Package />} text="Seasons" href="/seasons" />
              <SidebarItem
                icon={<Bell />}
                text="Notifications"
                href="/notifications"
                active
              />
              <SidebarItem icon={<Search />} text="Search" href="/search" />
              <SidebarItem
                icon={<Settings />}
                text="Settings"
                href="/settings"
              />
              <SidebarItem icon={<User />} text="Profile" href="/profile" />
            </>
          }
        >
          <Navbar />
          <div className="min-h-screen flex-1">
            <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
              {/* Header */}
              <div className="mb-6 lg:mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Bell
                        className={`h-7 w-7 lg:h-8 lg:w-8 ${
                          isMounted && isDarkMode
                            ? 'text-blue-400'
                            : 'text-blue-600'
                        }`}
                      />
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.span>
                      )}
                    </div>
                    <div>
                      <h1
                        className={`text-2xl font-bold lg:text-3xl ${
                          isMounted && isDarkMode
                            ? 'text-white'
                            : 'text-gray-900'
                        }`}
                      >
                        Notifications
                      </h1>
                      <p
                        className={`text-sm lg:text-base ${
                          isMounted && isDarkMode
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }`}
                      >
                        Stay updated with your latest football activities
                      </p>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                        isMounted && isDarkMode
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 animate-pulse rounded-full ${
                          isMounted && isDarkMode
                            ? 'bg-blue-400'
                            : 'bg-blue-500'
                        }`}
                      ></div>
                      {unreadCount} unread notification
                      {unreadCount !== 1 ? 's' : ''}
                    </motion.div>
                  )}
                </motion.div>
              </div>
              {/* Search and Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 rounded-xl border p-4 shadow-sm lg:mb-6 lg:p-6 ${
                  isMounted && isDarkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-col gap-4">
                  {/* Search */}
                  <div className="w-full">
                    <div className="relative">
                      <Search
                        className={`absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform ${
                          isMounted && isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-400'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none ${
                          isMounted && isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-400/20'
                            : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Filters Row */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Type Filter */}
                    <div>
                      <label
                        className={`mb-1 block text-xs font-medium ${
                          isMounted && isDarkMode
                            ? 'text-gray-300'
                            : 'text-gray-700'
                        }`}
                      >
                        Type
                      </label>
                      <select
                        value={filter.type || ''}
                        onChange={(e) =>
                          setFilter((prev) => ({
                            ...prev,
                            type:
                              (e.target.value as NotificationType) || undefined,
                          }))
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:ring-2 focus:outline-none ${
                          isMounted && isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-400/20'
                            : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                      >
                        <option value="">All Types</option>
                        {Object.values(NotificationType).map((type) => (
                          <option key={type} value={type}>
                            {type.replace(/([A-Z])/g, ' $1').trim()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Read Status Filter */}
                    <div>
                      <label
                        className={`mb-1 block text-xs font-medium ${
                          isMounted && isDarkMode
                            ? 'text-gray-300'
                            : 'text-gray-700'
                        }`}
                      >
                        Status
                      </label>
                      <select
                        value={
                          filter.read === undefined
                            ? ''
                            : filter.read.toString()
                        }
                        onChange={(e) =>
                          setFilter((prev) => ({
                            ...prev,
                            read:
                              e.target.value === ''
                                ? undefined
                                : e.target.value === 'true',
                          }))
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:ring-2 focus:outline-none ${
                          isMounted && isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-400/20'
                            : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                      >
                        <option value="">All Status</option>
                        <option value="false">Unread</option>
                        <option value="true">Read</option>
                      </select>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label
                        className={`mb-1 block text-xs font-medium ${
                          isMounted && isDarkMode
                            ? 'text-gray-300'
                            : 'text-gray-700'
                        }`}
                      >
                        Time Period
                      </label>
                      <select
                        value={filter.dateRange || 'all'}
                        onChange={(e) =>
                          setFilter((prev) => ({
                            ...prev,
                            dateRange: e.target.value as any,
                          }))
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:ring-2 focus:outline-none ${
                          isMounted && isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-400/20'
                            : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>

                    {/* Reset Filters */}
                    <div className="flex items-end">
                      <button
                        onClick={resetFilters}
                        className={`w-full rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:outline-none ${
                          isMounted && isDarkMode
                            ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700 focus:ring-gray-500/20'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500/20'
                        }`}
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Action Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`mb-4 rounded-xl border p-4 shadow-sm lg:mb-6 ${
                  isMounted && isDarkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-2 select-none">
                      <input
                        type="checkbox"
                        checked={
                          selectedNotifications.size ===
                            filteredNotifications.length &&
                          filteredNotifications.length > 0
                        }
                        onChange={toggleSelectAll}
                        className={`h-4 w-4 rounded border transition-colors focus:ring-2 focus:ring-offset-0 ${
                          isMounted && isDarkMode
                            ? 'border-gray-600 text-blue-400 focus:ring-blue-400/20'
                            : 'border-gray-300 text-blue-600 focus:ring-blue-500/20'
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isMounted && isDarkMode
                            ? 'text-gray-300'
                            : 'text-gray-700'
                        }`}
                      >
                        Select All
                      </span>
                    </label>

                    {filteredNotifications.length > 0 && (
                      <span
                        className={`text-sm ${
                          isMounted && isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}
                      >
                        ({filteredNotifications.length} total)
                      </span>
                    )}

                    {selectedNotifications.size > 0 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          isMounted && isDarkMode
                            ? 'bg-blue-900/50 text-blue-300'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {selectedNotifications.size} selected
                      </motion.span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {unreadCount > 0 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={markAllAsRead}
                        disabled={isLoading}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                          isMounted && isDarkMode
                            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50'
                            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50'
                        }`}
                      >
                        <CheckCheck size={16} />
                        Mark All Read
                      </motion.button>
                    )}

                    {selectedNotifications.size > 0 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={deleteSelectedNotifications}
                        disabled={isLoading}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                          isMounted && isDarkMode
                            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50'
                            : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50'
                        }`}
                      >
                        <Trash2 size={16} />
                        Delete ({selectedNotifications.size})
                      </motion.button>
                    )}

                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        disabled={isLoading}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                          isMounted && isDarkMode
                            ? 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700 focus:ring-gray-500/20'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500/20'
                        }`}
                      >
                        <X size={16} />
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
              {/* Notifications List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`overflow-hidden rounded-xl border shadow-sm ${
                  isMounted && isDarkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center lg:p-12">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                        isMounted && isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <Bell
                        className={`h-10 w-10 ${
                          isMounted && isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-400'
                        }`}
                      />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className={`mb-2 text-lg font-semibold lg:text-xl ${
                        isMounted && isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {notifications.length === 0
                        ? 'No notifications yet'
                        : 'No notifications match your filters'}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className={`mx-auto max-w-md ${
                        isMounted && isDarkMode
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {notifications.length === 0
                        ? "You're all caught up! New notifications will appear here when you have football activities."
                        : "Try adjusting your search or filter criteria to find the notifications you're looking for."}
                    </motion.p>
                    {notifications.length > 0 && (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        onClick={resetFilters}
                        className={`mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:outline-none ${
                          isMounted && isDarkMode
                            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50'
                            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50'
                        }`}
                      >
                        <Filter size={16} />
                        Clear All Filters
                      </motion.button>
                    )}
                  </div>
                ) : (
                  <div
                    className={`divide-y ${
                      isMounted && isDarkMode
                        ? 'divide-gray-700'
                        : 'divide-gray-100'
                    }`}
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredNotifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{
                            delay: index * 0.03,
                            duration: 0.3,
                            ease: 'easeOut',
                          }}
                          layout
                          className={`group relative transition-all duration-200 ${
                            !notification.isRead
                              ? isMounted && isDarkMode
                                ? 'border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-900/30 to-transparent'
                                : 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent'
                              : ''
                          } ${
                            selectedNotifications.has(notification.id)
                              ? isMounted && isDarkMode
                                ? 'bg-blue-900/30 ring-2 ring-blue-400/50'
                                : 'bg-blue-50 ring-2 ring-blue-200'
                              : isMounted && isDarkMode
                                ? 'hover:bg-gray-700'
                                : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="p-4 lg:p-6">
                            <div className="flex items-start gap-3 lg:gap-4">
                              {/* Selection Checkbox */}
                              <div className="flex items-center pt-1">
                                <input
                                  type="checkbox"
                                  checked={selectedNotifications.has(
                                    notification.id
                                  )}
                                  onChange={() =>
                                    toggleNotificationSelection(notification.id)
                                  }
                                  className={`h-4 w-4 rounded border transition-colors focus:ring-2 focus:ring-offset-0 ${
                                    isMounted && isDarkMode
                                      ? 'border-gray-600 text-blue-400 focus:ring-blue-400/20'
                                      : 'border-gray-300 text-blue-600 focus:ring-blue-500/20'
                                  }`}
                                />
                              </div>

                              {/* Notification Icon */}
                              <div className="flex-shrink-0 pt-1">
                                <div
                                  className={`rounded-lg border p-2 shadow-sm ${
                                    isMounted && isDarkMode
                                      ? 'border-gray-600 bg-gray-700'
                                      : 'border-gray-100 bg-white'
                                  }`}
                                >
                                  {getNotificationIcon(notification.type)}
                                </div>
                              </div>

                              {/* Notification Content */}
                              <div
                                className="min-w-0 flex-1 cursor-pointer"
                                onClick={() =>
                                  handleNotificationClick(notification)
                                }
                              >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    {notification.title && (
                                      <h3
                                        className={`mb-1 line-clamp-2 text-base font-semibold lg:text-lg ${
                                          isMounted && isDarkMode
                                            ? 'text-white'
                                            : 'text-gray-900'
                                        }`}
                                      >
                                        {notification.title}
                                      </h3>
                                    )}
                                    <p
                                      className={`line-clamp-3 text-sm leading-relaxed lg:text-base ${
                                        isMounted && isDarkMode
                                          ? 'text-gray-300'
                                          : 'text-gray-700'
                                      }`}
                                    >
                                      {notification.content}
                                    </p>
                                  </div>

                                  {!notification.isRead && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ring-2 ${
                                        isMounted && isDarkMode
                                          ? 'bg-blue-400 ring-blue-400/50'
                                          : 'bg-blue-500 ring-blue-200'
                                      }`}
                                    />
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span
                                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getNotificationTypeColor(notification.type)}`}
                                    >
                                      {notification.type
                                        .replace(/([A-Z])/g, ' $1')
                                        .trim()}
                                    </span>

                                    <div
                                      className={`flex items-center gap-1 text-xs lg:text-sm ${
                                        isMounted && isDarkMode
                                          ? 'text-gray-400'
                                          : 'text-gray-500'
                                      }`}
                                    >
                                      <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                                      <time dateTime={notification.time}>
                                        {new Date(
                                          notification.time
                                        ).toLocaleString(undefined, {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </time>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    {!notification.isRead && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notification.id);
                                        }}
                                        className={`rounded-lg p-2 transition-all duration-200 focus:ring-2 focus:outline-none ${
                                          isMounted && isDarkMode
                                            ? 'text-blue-400 hover:bg-blue-900/50 hover:text-blue-300 focus:ring-blue-400/50'
                                            : 'text-blue-600 hover:bg-blue-100 hover:text-blue-700 focus:ring-blue-500/50'
                                        }`}
                                        title="Mark as read"
                                      >
                                        <CheckCheck size={16} />
                                      </button>
                                    )}

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                      className={`rounded-lg p-2 transition-all duration-200 focus:ring-2 focus:outline-none ${
                                        isMounted && isDarkMode
                                          ? 'text-gray-400 hover:bg-red-900/50 hover:text-red-400 focus:ring-red-400/50'
                                          : 'text-gray-400 hover:bg-red-100 hover:text-red-600 focus:ring-red-500/50'
                                      }`}
                                      title="Delete notification"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Load More Button */}
                {hasMore && filteredNotifications.length > 0 && (
                  <div
                    className={`border-t p-4 text-center lg:p-6 ${
                      isMounted && isDarkMode
                        ? 'border-gray-700 bg-gray-700/50'
                        : 'border-gray-100 bg-gray-50/50'
                    }`}
                  >
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={loadMore}
                      disabled={loading}
                      className={`inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition-all duration-200 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                        isMounted && isDarkMode
                          ? 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700 focus:ring-gray-500/20'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500/20'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div
                            className={`h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${
                              isMounted && isDarkMode
                                ? 'border-gray-400'
                                : 'border-gray-400'
                            }`}
                          ></div>
                          Loading more...
                        </>
                      ) : (
                        'Load More Notifications'
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </SidebarLayout>
      </div>
    </ProtectedRoute>
  );
};

export default NotificationsPage;
