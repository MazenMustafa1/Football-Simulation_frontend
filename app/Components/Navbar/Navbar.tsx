import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            const data = await response.json();
            setNotifications(data);
            setUnreadCount(data.filter(notification => !notification.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    return (
        <div className="navbar bg-white shadow-sm">
            <div >
                <Link href="/">
                    <label className="input w-230 cursor-pointer">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2.5"
                                fill="none"
                                stroke="currentColor"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </g>
                        </svg>
                        <input type="search" required placeholder="Search" />
                    </label>
                </Link>
            </div>

            <div className="flex navbar-end">
                <div className="dropdown dropdown-end">
                    <button className="btn btn-ghost btn-circle px-5">
                        <div className="indicator">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
                            {unreadCount > 0 && <span className="badge badge-xs badge-primary indicator-item">{unreadCount}</span>}
                        </div>
                    </button>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        {notifications.length === 0 ? (
                            <li><a>No new notifications</a></li>
                        ) : (
                            notifications.map((notification, index) => (
                                <li key={index}>
                                    <a>{notification.message}</a>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <div className="dropdown dropdown-end">
                    <Link href="/profile">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="Tailwind CSS Navbar component"
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                            </div>
                        </div>
                    </Link>

                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li>
                            <a className="justify-between">
                                Profile
                                <span className="badge">New</span>
                            </a>
                        </li>
                        <li><a>Settings</a></li>
                        <li><a>Logout</a></li>
                    </ul>
                </div>
                <div className="text-left px-2">
                    <h1 className=" font-semibold text-base">First Last</h1>
                    <h3 className="font-thin text-xs text-gray-400">Welcome to our site</h3>
                </div>
            </div>
        </div>
    )
}
