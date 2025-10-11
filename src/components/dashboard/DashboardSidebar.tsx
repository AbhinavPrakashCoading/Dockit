// Dashboard Sidebar Component - Navigation and user info
'use client';

import React from 'react';
import { 
  Home, 
  Upload, 
  FileText, 
  Package, 
  BarChart3, 
  Settings,
  AlignJustify
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
  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'packages', label: 'ZIP Packages', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        {collapsed ? (
          // Just the logo icon when collapsed (acts as burger menu)
          <DockitLogo 
            size="md" 
            variant="icon" 
            onLogoClick={onToggleCollapse}
            className="cursor-pointer"
          />
        ) : (
          // Logo + text when expanded (logo = burger, text = home)
          <DockitLogo 
            size="md" 
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
  );
};

export default DashboardSidebar;