// Dashboard Header Component - Top navigation and user menu
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { 
  Bell, 
  User, 
  Cloud, 
  Shield, 
  LogOut 
} from 'lucide-react';
import { Notification } from './types';

interface DashboardHeaderProps {
  user?: any;
  sidebarCollapsed: boolean;
  notifications?: Notification[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user, 
  sidebarCollapsed, 
  notifications = [] 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`hidden lg:flex fixed top-0 right-0 left-0 bg-white border-b border-gray-200 z-20 transition-all duration-300 ${
      sidebarCollapsed ? 'ml-16' : 'ml-64'
    }`}>
      <div className="flex items-center px-6 py-4 w-full">
        <div className="flex items-center space-x-4 ml-auto">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-lg relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500 text-sm">
                    No notifications
                  </div>
                )}
                <div className="px-4 py-2 text-center">
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            {user?.isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">Drive Connected</span>
                </div>
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                )}
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 text-gray-400" />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-600">Guest Session</span>
                </div>
                <Link
                  href="/auth/signin"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;