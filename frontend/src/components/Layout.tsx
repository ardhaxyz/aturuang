import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Home, PlusCircle, CheckSquare, LogOut, Users } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/book', label: 'Book Room', icon: <PlusCircle size={20} /> },
    { path: '/rooms', label: 'Rooms', icon: <Users size={20} /> },
    { path: '/calendar', label: 'Calendar', icon: <Calendar size={20} /> },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: <CheckSquare size={20} /> });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Meeting Room Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.username} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 ${
                isActive(item.path)
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200">
        <nav className="mt-5 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Adjust main content for sidebar */}
      <div className="hidden md:block ml-64">
        {/* This div pushes content to the right of sidebar */}
      </div>
    </div>
  );
}
