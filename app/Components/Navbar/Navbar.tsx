'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, X, CheckCheck, Bell, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import authService from '@/Services/AuthenticationService';
import notificationService, {
  Notification,
} from '@/Services/NotificationService';

interface UserStorage {
  userId: string;
  username: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export default function Navbar() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{
    username?: string;
    email?: string;
    avatarUrl?: string;
  } | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Initialize notification service and setup real-time notifications
    const initializeNotifications = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Initialize the notification service
          await notificationService.initialize();

          // Setup real-time event listeners
          notificationService.on(
            'notificationReceived',
            (notification: Notification) => {
              setNotifications((prev) => [notification, ...prev]);
              setUnreadCount((prev) => prev + 1);
            }
          );

          notificationService.on(
            'notificationUpdated',
            (notification: Notification) => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? notification : n))
              );
              if (notification.isread) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
              }
            }
          );

          notificationService.on(
            'notificationDeleted',
            (notificationId: string) => {
              setNotifications((prev) => {
                const notification = prev.find((n) => n.id === notificationId);
                const newNotifications = prev.filter(
                  (n) => n.id !== notificationId
                );
                if (notification && !notification.isread) {
                  setUnreadCount((prev) => Math.max(0, prev - 1));
                }
                return newNotifications;
              });
            }
          );

          // Fetch initial notifications and user data
          await Promise.all([fetchUserData(), fetchNotifications()]);
        } catch (error) {
          console.error('Error initializing notifications:', error);
          toast.error('Failed to initialize notifications');
        }
      }
    };

    initializeNotifications();

    // Cleanup function
    return () => {
      notificationService.off('notificationReceived', () => {});
      notificationService.off('notificationUpdated', () => {});
      notificationService.off('notificationDeleted', () => {});
    };
  }, []);

  const fetchUserData = async () => {
    if (authService.isAuthenticated()) {
      const currentUser: UserStorage =
        localStorage.getItem('user') &&
        JSON.parse(localStorage.getItem('user') || '');
      if (currentUser && currentUser.userId) {
        try {
          const userProfile = await authService.getUserProfile(
            currentUser.userId
          );
          setUser({
            username: userProfile.username,
            email: userProfile.email,
            avatarUrl: userProfile.imageUrl || '/default-avatar.jpeg',
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          toast.error('Failed to load user profile');
        }
      }
    }
  };

  const fetchNotifications = async () => {
    if (!authService.isAuthenticated()) return;

    setIsLoading(true);
    try {
      const result = await notificationService.getUserNotifications(1, 20);
      setNotifications(result.notifications);

      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      const success = await notificationService.markAllAsRead();
      if (success) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      } else {
        toast.error('Failed to mark notifications as read');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const success =
        await notificationService.deleteNotification(notificationId);
      if (success) {
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (notification && !notification.isread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast.success('Notification deleted');
      } else {
        toast.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const clearAllNotifications = async () => {
    try {
      setIsLoading(true);
      const success = await notificationService.deleteAllNotifications();
      if (success) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success('All notifications cleared');
      } else {
        toast.error('Failed to clear notifications');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #E5E7EB',
            borderRadius: '0.5rem',
            boxShadow:
              '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
      <div className="navbar bg-white px-4 py-2 shadow-sm transition-all duration-300 ease-in-out">
        <div className="flex-1">
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
            <input
              type="search"
              className="block w-full rounded-lg border border-gray-200 py-2 pr-3 pl-10 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Search..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="btn btn-ghost btn-circle relative p-2 transition-colors duration-200 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex translate-x-1/2 -translate-y-1/2 transform animate-pulse items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs leading-none font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="animate-dropdown absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        disabled={isLoading}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        title="Mark all as read"
                      >
                        <CheckCheck size={12} />
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        disabled={isLoading}
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Clear all notifications"
                      >
                        <Trash2 size={12} />
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      <div className="mx-auto mb-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      <Bell size={24} className="mx-auto mb-2 text-gray-400" />
                      No notifications
                    </div>
                  ) : (
                    <div>
                      {notifications.map(
                        (notification: Notification, index) => (
                          <div
                            key={notification.id || index}
                            className={`group border-b border-gray-100 p-3 transition-colors hover:bg-gray-50 ${
                              !notification.isread
                                ? 'border-l-4 border-l-blue-500 bg-blue-50'
                                : ''
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex flex-1 items-start">
                                <div
                                  className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                                    !notification.isread
                                      ? 'bg-blue-500'
                                      : 'bg-transparent'
                                  }`}
                                ></div>
                                <div className="ml-2 min-w-0 flex-grow">
                                  {notification.title && (
                                    <p className="mb-1 text-sm font-semibold text-gray-800">
                                      {notification.title}
                                    </p>
                                  )}
                                  <p className="text-sm break-words text-gray-700">
                                    {notification.message}
                                  </p>
                                  <div className="mt-1 flex items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                      {new Date(
                                        notification.time
                                      ).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                    <span
                                      className={`rounded-full px-2 py-1 text-xs ${
                                        notification.type === 'error'
                                          ? 'bg-red-100 text-red-800'
                                          : notification.type === 'warning'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : notification.type === 'success'
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-blue-100 text-blue-800'
                                      }`}
                                    >
                                      {notification.type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                {!notification.isread && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                    title="Mark as read"
                                  >
                                    <CheckCheck size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  className="p-1 text-red-600 hover:text-red-800"
                                  title="Delete notification"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 bg-gray-50 p-2 text-center">
                  <Link
                    href="/notifications"
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center rounded-full p-1 transition-colors duration-200 hover:bg-gray-100"
            >
              <div className="avatar">
                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-gray-200 transition-all duration-200 hover:border-blue-400">
                  <img
                    src={user?.avatarUrl || '/default-avatar.jpeg'}
                    alt="User avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="ml-2 hidden text-left md:block">
                <h1 className="text-sm font-semibold text-gray-800">
                  {user?.username || 'Guest User'}
                </h1>
                <h3 className="text-xs font-normal text-gray-400">
                  {user?.email || 'Welcome to our site'}
                </h3>
              </div>
            </button>

            {isProfileOpen && (
              <div className="animate-dropdown absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center">
                    <div className="mr-3 h-10 w-10 overflow-hidden rounded-full">
                      <img
                        src={user?.avatarUrl || '/default-avatar.jpeg'}
                        alt="User avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">
                        {user?.username || 'Guest User'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {user?.email || 'guest@example.com'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
