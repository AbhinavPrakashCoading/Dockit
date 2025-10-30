// Dashboard Sidebar Component - Navigation and user info with mobile responsiveness
'use client';

import React, { useState } from 'react';
import {
  Home,
  Upload,
  FileText,
  Package,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { DockitLogo } from '@/components/DockitLogo';
import { User, ActiveSection, SidebarItem } from './types';

interface DashboardSidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  user?: User;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  user
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'packages', label: 'ZIPs', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const NavLink = ({ item }: { item: SidebarItem }) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;

    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSectionChange(item.id);
          setSidebarOpen(false);
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
          isActive
            ? 'bg-purple-50 text-purple-600 border-l-4 border-purple-600 -ml-1 pl-3'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{item.label}</span>
      </a>
    );
  };

  return (
    <>
      {/* Mobile Header - Only show on screens smaller than md (768px) */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <DockitLogo
            size="sm"
            variant="full"
            onLogoClick={() => setSidebarOpen(!sidebarOpen)}
            onTextClick={() => onSectionChange('overview')}
            className="cursor-pointer"
          />

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} className="text-gray-600" />
            </button>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay - Only show on screens smaller than md */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Only show on screens smaller than md */}
      <aside className={`
        md:hidden fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 w-64
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <DockitLogo
              size="md"
              variant="full"
              onLogoClick={() => setSidebarOpen(false)}
              onTextClick={() => {
                onSectionChange('overview');
                setSidebarOpen(false);
              }}
              className="cursor-pointer"
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </nav>

          {/* User Info (Mobile) */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Tablet Sidebar - Show on md to xl screens (768px to 1280px) */}
      <div className={`hidden md:flex xl:hidden fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex flex-col w-full">
          <div className="p-4">
            {collapsed ? (
              // Just the logo icon when collapsed
              <DockitLogo
                size="sm"
                variant="icon"
                onLogoClick={onToggleCollapse}
                className="cursor-pointer"
              />
            ) : (
              // Logo + text when expanded
              <DockitLogo
                size="sm"
                variant="icon"
                showText={true}
                onLogoClick={onToggleCollapse}
                onTextClick={() => onSectionChange('overview')}
                className="cursor-pointer"
              />
            )}
          </div>

          <nav className="mt-8">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                    activeSection === item.id ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600' : 'text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4 space-y-3">
            {!collapsed && user?.isAuthenticated && (user.storageUsed || 0) > 0 && (
              <>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Storage</span>
                    <span className="font-medium">{Math.round(((user.storageUsed || 0) / (user.storageLimit || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-600 h-1 rounded-full"
                      style={{ width: `${((user.storageUsed || 0) / (user.storageLimit || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {user.storageUsed}GB of {user.storageLimit}GB used
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Only show on xl and above (1280px+) */}
      <div className={`hidden xl:flex fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex flex-col w-full">
          <div className="p-4">
            {collapsed ? (
              // Just the logo icon when collapsed (acts as burger menu)
              <DockitLogo
                size="xl"
                variant="icon"
                onLogoClick={onToggleCollapse}
                className="cursor-pointer"
              />
            ) : (
              // Logo + text when expanded (logo = burger, text = home)
              <DockitLogo
                size="xl"
                variant="icon"
                showText={true}
                onLogoClick={onToggleCollapse}
                onTextClick={() => onSectionChange('overview')}
                className="cursor-pointer"
              />
            )}
          </div>

          <nav className="mt-8">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                    activeSection === item.id ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600' : 'text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4 space-y-3">
            {!collapsed && user?.isAuthenticated && (user.storageUsed || 0) > 0 && (
              <>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Storage</span>
                    <span className="font-medium">{Math.round(((user.storageUsed || 0) / (user.storageLimit || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-600 h-1 rounded-full"
                      style={{ width: `${((user.storageUsed || 0) / (user.storageLimit || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {user.storageUsed}GB of {user.storageLimit}GB used
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) - Only show on screens smaller than lg */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {sidebarItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSectionChange(item.id);
                }}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-lg cursor-pointer"
              >
                <Icon
                  size={22}
                  className={`mb-1 ${isActive ? 'text-purple-600' : 'text-gray-600'}`}
                />
                <span className={`text-xs ${isActive ? 'text-purple-600 font-semibold' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default DashboardSidebar;