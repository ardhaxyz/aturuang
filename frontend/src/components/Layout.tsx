import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { 
  Calendar, 
  Home, 
  PlusCircle, 
  CheckSquare, 
  LogOut, 
  Users, 
  Moon, 
  Sun, 
  Building2, 
  Settings, 
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout, isSuperadmin, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/book', label: 'Book', icon: PlusCircle },
    { path: '/rooms', label: 'Rooms', icon: Users },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  const adminNavItems = [
    ...(isSuperadmin ? [{ path: '/admin/organizations', label: 'Organizations', icon: Building2 }] : []),
    { path: '/admin/rooms', label: 'Manage Rooms', icon: Settings },
    { path: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="ml-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                Aturuang
              </h1>
            </div>

            {/* Desktop Horizontal Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin Link - Simple */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive('/admin')
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <CheckSquare size={18} className="mr-2" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Right Side - User Info & Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
                {user?.username}
              </span>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <button
                onClick={logout}
                className="hidden sm:inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 space-y-1">
              {/* Main Navigation */}
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Separator */}
              {isAdmin && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  
                  {/* Admin Navigation */}
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                          isActive(item.path)
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon size={20} className="mr-3" />
                        {item.label}
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Separator */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

              {/* Logout */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center px-3 py-3 text-base font-medium text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={20} className="mr-3" />
                Logout
              </button>

              {/* Footer in Mobile Menu */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>© 2026 Aturuang</p>
                  <p>for Coordinating Ministry for Food Affairs</p>
                  <p className="pt-1">Built with <span className="grayscale">☕</span> + <span className="grayscale">❄️</span> + <span className="grayscale">🤖</span> by ardhaxyz</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Icons Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="flex justify-around items-center h-16 px-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center p-2 ${
                  isActive(item.path)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon size={24} />
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex flex-col items-center justify-center p-2 ${
                isActive('/admin')
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Settings size={24} />
            </Link>
          )}
        </div>
      </nav>

      {/* Desktop Footer - Hidden on Mobile */}
      <footer className="hidden md:block bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              © 2026 Aturuang for Coordinating Ministry for Food Affairs
            </p>
            <p className="mt-2 sm:mt-0 flex items-center gap-1">
              Built with <span className="grayscale">☕</span> + <span className="grayscale">❄️</span> + <span className="grayscale">🤖</span> by ardhaxyz
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
