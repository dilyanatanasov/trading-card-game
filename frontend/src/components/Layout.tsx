import { Outlet, Link, useLocation } from 'react-router-dom';
import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Collection', href: '/collection' },
  { name: 'Battle', href: '/battle' },
  { name: 'Trading', href: '/trading' },
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'Gifts', href: '/gifts' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen transition-colors">
      <nav className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg border-b-2 border-purple-300 dark:border-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Trading Cards
                </h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <div className="hidden sm:flex items-center">
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mr-1 sm:mr-2">
                  Coins:
                </span>
                <span className="text-sm sm:text-lg font-bold text-yellow-600 dark:text-yellow-500">
                  {user?.coins || 0}
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <Menu as="div" className="relative hidden md:block">
                <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                      <div className="font-semibold">{user?.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <div className="flex items-center px-3 py-2">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold mr-3">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user?.username}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Coins:</span>
                    <span className="text-lg font-bold text-yellow-600 dark:text-yellow-500">{user?.coins || 0}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
