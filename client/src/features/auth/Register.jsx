import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { registerUser, clearError } from './authSlice';
import { User as UserIcon, Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    setValidationError('');
    setSuccessMessage('');
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    if (!name || !email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setValidationError('Password must contain at least one letter and one number.');
      return;
    }

    try {
      const resultAction = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(resultAction)) {
        setSuccessMessage(
          resultAction.payload.message ||
            'Registration successful. We have sent a verification link to your email.'
        );
        // Clear fields
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setValidationError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-stone-900">Create Account</h2>
          <p className="text-stone-500 mt-2">Join CrustCraft to design custom pizzas</p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-green-50 text-green-800 p-4 rounded-xl flex items-start space-x-2 mb-6 border border-green-100 animate-pulse">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {(validationError || error) && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start space-x-2 mb-6 border border-red-100">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{validationError || error}</span>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pizza-500 focus:bg-white transition-all text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pizza-500 focus:bg-white transition-all text-sm"
                  placeholder="At least 6 chars, letters & numbers"
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
                  <UserPlus className="h-5 w-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-stone-500 mt-8">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-pizza-600 hover:text-pizza-700 transition-colors"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
