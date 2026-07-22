import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { resetPassword, clearError } from './authSlice';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    setValidationError('');
    setSuccess('');
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccess('');

    if (!token) {
      setValidationError('Missing reset token. Please request a new link.');
      return;
    }

    if (!password || !confirmPassword) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    const resultAction = await dispatch(resetPassword({ token, password }));
    if (resetPassword.fulfilled.match(resultAction)) {
      setSuccess(
        resultAction.payload.message ||
          'Password has been reset successfully! You can now log in.'
      );
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-stone-900">Set New Password</h2>
          <p className="text-stone-500 mt-2">Enter your new secure password below</p>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="bg-green-50 text-green-800 p-4 rounded-xl flex items-start space-x-2 mb-6 border border-green-100 font-medium text-sm">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
            <div className="space-y-3">
              <span>{success}</span>
              <Link
                to="/login"
                className="flex items-center space-x-1 font-bold text-green-900 hover:underline"
              >
                <span>Go to Login</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {(validationError || error) && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start space-x-2 mb-6 border border-red-100 text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                New Password
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
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-sm font-semibold text-stone-500 hover:text-stone-700 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
