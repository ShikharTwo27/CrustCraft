import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { logoutUser } from '../../features/auth/authSlice';
import { Pizza, LogOut, ShieldAlert } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-pizza-500 p-2 rounded-xl text-white shadow-md shadow-pizza-500/20">
                <Pizza className="h-6 w-6 animate-pulse" />
              </div>
              <span className="text-xl font-bold tracking-tight text-stone-900 hidden sm:block">
                Crust<span className="text-pizza-500">Craft</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto max-w-[calc(100vw-85px)] sm:max-w-none scrollbar-none py-1">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-pizza-600 bg-orange-50/50' : 'text-stone-600 hover:text-pizza-600'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/builder"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/builder') ? 'text-pizza-600 bg-orange-50/50' : 'text-stone-600 hover:text-pizza-600'
                  }`}
                >
                  Build Pizza
                </Link>
                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/orders') ? 'text-pizza-600 bg-orange-50/50' : 'text-stone-600 hover:text-pizza-600'
                  }`}
                >
                  My Orders
                </Link>

                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/inventory"
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                        isActive('/admin/inventory')
                          ? 'text-rose-700 bg-rose-100'
                          : 'text-rose-650 hover:text-rose-700 bg-rose-50 hover:bg-rose-100'
                      }`}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      <span>Stock Panel</span>
                    </Link>
                    <Link
                      to="/admin/orders"
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                        isActive('/admin/orders')
                          ? 'text-pizza-700 bg-orange-100'
                          : 'text-pizza-655 hover:text-pizza-750 bg-orange-50 hover:bg-orange-100'
                      }`}
                    >
                      <Pizza className="h-4 w-4" />
                      <span>Orders Panel</span>
                    </Link>
                  </>
                )}

                {/* User details and logout */}
                <div className="flex items-center space-x-2 border-l border-stone-200 pl-4 ml-2">
                  <div className="flex flex-col text-right hidden sm:flex">
                    <span className="text-sm font-semibold text-stone-800">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-stone-500 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-stone-500 hover:text-pizza-600 p-2 rounded-full hover:bg-stone-100 transition-all"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-stone-600 hover:text-pizza-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="pizza-gradient hover:pizza-gradient-hover text-white px-4 py-2 rounded-md text-sm font-medium shadow-md shadow-pizza-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
