import React, { useState } from 'react';
import { Home, Upload, FileText, Package, BarChart3, Settings, Menu, X, Bell, Shield, ChevronRight, Plus, Zap, Eye, TrendingUp } from 'lucide-react';

const DockitDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home, href: '/overview' },
    { id: 'upload', label: 'Upload', icon: Upload, href: '/upload' },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/documents' },
    { id: 'zip', label: 'ZIPs', icon: Package, href: '/zip-packages' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const stats = [
    { label: 'Total Documents', value: '0', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'Processing', value: '0', icon: Upload, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Validated', value: '0', icon: Shield, color: 'bg-green-100 text-green-600' },
    { label: 'Issues', value: '0', icon: Bell, color: 'bg-red-100 text-red-600' },
  ];

  const quickActions = [
    { 
      title: 'Upload Documents', 
      description: 'Start processing your documents',
      icon: Plus,
      color: 'bg-purple-100 text-purple-600',
      href: '/upload'
    },
    { 
      title: 'View Documents', 
      description: 'Manage your document library',
      icon: Eye,
      color: 'bg-blue-100 text-blue-600',
      href: '/documents'
    },
    { 
      title: 'View Analytics', 
      description: 'Track processing performance',
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600',
      href: '/analytics'
    },
  ];

  const NavLink = ({ item }) => {
    const Icon = item.icon;
    const isActive = activePage === item.id;
    
    return (
      <a 
        href={item.href}
        onClick={(e) => {
          e.preventDefault();
          setActivePage(item.id);
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <FileText size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-purple-600">DocKit</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} className="text-gray-600" />
            </button>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:flex fixed top-0 left-64 right-0 bg-white border-b border-gray-200 z-40 px-8 py-4">
        <div className="flex items-center justify-end gap-4 w-full">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Drive Connected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
              A
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Abhinav Prakash</div>
              <div className="text-xs text-gray-500">abhinavprakashwork@gmail.com</div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <FileText size={22} className="text-white" />
              </div>
              <span className="text-xl font-bold text-purple-600">DocKit</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </nav>

          {/* User Info (Mobile) */}
          <div className="lg:hidden p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">Abhinav Prakash</div>
                <div className="text-xs text-gray-500 truncate">abhinavprakashwork@gmail.com</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 lg:mt-20 mt-14 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, Abhinav!
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Here's what's happening with your documents today.
                </p>
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-600/30">
                <Package size={20} />
                <span>Generate Zip</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className="md:w-6 md:h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generate ZIP Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Generate ZIP Package
                </h2>
                <p className="text-purple-100 text-sm md:text-base">
                  Create document packages for exam submissions
                </p>
              </div>
              <button className="bg-white text-purple-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg">
                <Package size={20} />
                <span>Generate Package</span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <a 
                    key={index}
                    href={action.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePage(action.href.replace('/', ''));
                    }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                    <div className="flex items-center gap-1 text-purple-600 text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Get started</span>
                      <ChevronRight size={16} />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage(item.id);
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
    </div>
  );
};

export default DockitDashboard;