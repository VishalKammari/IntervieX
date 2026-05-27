// import React from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import ThemeToggle from './ThemeToggle';
// import { LogOut, LayoutDashboard, FileText, Briefcase } from 'lucide-react';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const isActive = (path) => location.pathname === path;

//   return (
//     <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-gray-200/50 dark:bg-darkBg/70 dark:border-gray-800/50 transition-colors duration-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           {/* Logo */}
//           <div className="flex items-center">
//             <Link to="/" className="flex items-center space-x-2">
//               <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/10">
//                 <Briefcase className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
//                 PrepAI
//               </span>
//             </Link>
//           </div>

//           {/* Navigation Links */}
//           <div className="flex items-center space-x-4">
//             {user ? (
//               <>
//                 <Link
//                   to="/dashboard"
//                   className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                     isActive('/dashboard')
//                       ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
//                       : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
//                   }`}
//                 >
//                   <LayoutDashboard className="w-4 h-4" />
//                   <span className="hidden sm:inline">Dashboard</span>
//                 </Link>
//                 <Link
//                   to="/resumes"
//                   className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                     isActive('/resumes')
//                       ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
//                       : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
//                   }`}
//                 >
//                   <FileText className="w-4 h-4" />
//                   <span className="hidden sm:inline">Resumes</span>
//                 </Link>

//                 <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>

//                 <div className="flex items-center space-x-3">
//                   <span className="hidden md:inline text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
//                     {user.name}
//                   </span>
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center space-x-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
//                     aria-label="Logout"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     <span className="hidden sm:inline">Sign Out</span>
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <Link
//                   to="/login"
//                   className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
//                 >
//                   Sign In
//                 </Link>
//                 <Link
//                   to="/register"
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
//                 >
//                   Get Started
//                 </Link>
//               </>
//             )}

//             <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>
//             <ThemeToggle />
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

import {
  LogOut,
  LayoutDashboard,
  FileText,
  Briefcase,
  Plus,
  Menu,
  X,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky bg-black top-0 z-50 w-full border-b border-white/10  backdrop-blur-xl transition-all duration-300 dark:border-gray-800/50 dark:bg-black/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-10">
            {/* LOGO */}
            <Link
              to="/"
              className="group flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-105">
                <Briefcase className="h-5 w-5 text-white" />
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-400 dark:to-purple-400">
                  PrepAI
                </h1>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            {user && (
              <div className="hidden items-center gap-2 md:flex">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        isActive(item.path)
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />

                      <span>{item.label}</span>

                      <span
                        className={`absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-indigo-500 transition-all duration-300 ${
                          isActive(item.path)
                            ? 'w-8'
                            : 'group-hover:w-6'
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* NEW INTERVIEW BUTTON */}
                <Link
                  to="/interview/create"
                  className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-indigo-500/30 active:scale-[0.98] sm:flex"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Interview</span>
                </Link>

                {/* USER */}
                <div className="hidden items-center gap-3 md:flex">
                  {/* AVATAR */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-bold text-white shadow-md">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* NAME */}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {user.name}
                    </span>

                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Candidate
                    </span>
                  </div>
                </div>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:scale-[1.02] hover:bg-red-50 hover:text-red-600 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-red-950/20 dark:hover:text-red-400"
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
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-indigo-500/30 active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* THEME TOGGLE */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() =>
                setMobileMenuOpen(!mobileMenuOpen)
              }
              className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 py-4 dark:border-gray-800 md:hidden">
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
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}

                  <Link
                    to="/interview/create"
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white"
                  >
                    <Plus className="h-4 w-4" />
                    New Interview
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>

                  <div className="pt-2">
                    <ThemeToggle />
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-center text-sm font-medium text-white"
                  >
                    Get Started
                  </Link>

                  <div className="pt-2">
                    <ThemeToggle />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;