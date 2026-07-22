import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/store';
import { verifyEmail } from './authSlice';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token in link.');
        return;
      }

      const resultAction = await dispatch(verifyEmail(token));
      if (verifyEmail.fulfilled.match(resultAction)) {
        setStatus('success');
        setMessage(resultAction.payload.message || 'Your email has been verified successfully!');
      } else {
        setStatus('error');
        setMessage(resultAction.payload || 'Email verification link is invalid or has expired.');
      }
    };

    runVerification();
  }, [dispatch, token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xl max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-pizza-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">Verifying Account</h2>
            <p className="text-stone-500">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="flex justify-center text-green-500">
              <CheckCircle2 className="h-20 w-20 animate-bounce" />
            </div>
            <h2 className="text-3xl font-extrabold text-stone-900">Email Verified!</h2>
            <p className="text-stone-600 font-medium">{message}</p>
            <Link
              to="/login"
              className="w-full flex items-center justify-center space-x-2 pizza-gradient hover:pizza-gradient-hover text-white py-3 rounded-xl font-bold shadow-md shadow-pizza-500/20 transition-all hover:-translate-y-0.5"
            >
              <span>Continue to Login</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="flex justify-center text-rose-500">
              <XCircle className="h-20 w-20" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900">Verification Failed</h2>
            <p className="text-rose-600 font-medium text-sm bg-rose-50 p-4 rounded-xl border border-rose-100">
              {message}
            </p>
            <div className="flex flex-col space-y-3">
              <Link
                to="/register"
                className="w-full flex items-center justify-center bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-bold transition-all"
              >
                <span>Create New Account</span>
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold text-stone-500 hover:text-stone-700 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
