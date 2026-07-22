import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { loginUser, clearError } from './authSlice';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Get path to redirect back to, default is home "/"
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Clear any previous Redux slice errors on mount
    dispatch(clearError());
    setValidationError('');
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-stone-900">Welcome Back</h2>
          <p className="text-stone-500 mt-2">Log in to order your customized pizza</p>
        </div>

        {/* Dynamic Alerts */}
        {(validationError || error) && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start space-x-2 mb-6 border border-red-100">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pizza-500 focus:bg-white transition-all text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-stone-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-pizza-600 hover:text-pizza-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pizza-500 focus:bg-white transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 pizza-gradient hover:pizza-gradient-hover text-white py-3 rounded-xl font-bold shadow-md shadow-pizza-500/20 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-8">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-pizza-600 hover:text-pizza-700 transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
