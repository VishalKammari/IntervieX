import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  LogOut,
  LayoutDashboard,
  FileText,
  Briefcase,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import {User} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] =
    React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/resumes',
      label: 'Resumes',
      icon: FileText,
    },
    {
      path: '/about',
      label: 'About',
      icon: Briefcase,
    },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-black backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-10">
      
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg  transition-all duration-300 group-hover:scale-105">
              
              <img src={'/logo.svg'} alt="" />
            </div>

            <h1 className="instrument-serif-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              IntervieX
            </h1>
          </Link>

          {user && (
            <div className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
             <div className="hidden items-center gap-3 md:flex">
                <User />

                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    {user.name}
                  </span>

                  <span className="text-xs text-gray-400">
                    Candidate
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                >
                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-xl px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-white/20 ease-in hover:text-white sm:block"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black shadow-lg shadow-white
                /20 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </>
          )}
          <button
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            className="rounded-xl p-2 text-gray-300 transition hover:bg-white/5 md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-black/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() =>
                        setMobileMenuOpen(false)
                      }
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        isActive(item.path)
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;