'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '@/Services/AuthenticationService';
import axios from 'axios';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}
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
          }
        }
      }
    };

    fetchUserData().then();
    fetchNotifications().then();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        'https://localhost:7082/api/notifications'
      );
      const data = response.data;
      setNotifications(data);
      setUnreadCount(
        data.filter((notification: Notification) => !notification.read).length
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(
        'https://localhost:7082/api/notifications/mark-all-read'
      );
      setNotifications(
        notifications.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
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
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No notifications
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification: Notification, index) => (
                      <div
                        key={notification.id || index}
                        className={`border-b border-gray-100 p-3 transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start">
                          <div
                            className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${!notification.read ? 'bg-blue-500' : 'bg-transparent'}`}
                          ></div>
                          <div className="ml-2 flex-grow">
                            <p className="text-sm text-gray-700">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {new Date(
                                notification.createdAt
                              ).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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
  );
}
