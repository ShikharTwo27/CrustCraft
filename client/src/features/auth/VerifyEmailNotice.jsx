import React from 'react';
import { useAppSelector } from '../../hooks/store';
import { Mail, ShieldAlert } from 'lucide-react';

export const VerifyEmailNotice = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xl max-w-md w-full text-center space-y-6">
        <div className="flex justify-center text-pizza-500">
          <div className="bg-orange-50 p-4 rounded-full">
            <Mail className="h-16 w-16" />
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-stone-900">Verify Your Email</h2>
        
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl flex items-start space-x-2 text-left border border-amber-100 text-sm font-medium">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
          <span>You must verify your email address to access the pizza customizer and order flows.</span>
        </div>

        <p className="text-stone-600 text-sm leading-relaxed">
          We have sent a verification link to <span className="font-semibold text-stone-900">{user?.email}</span>. 
          Please click the link in that email to confirm your account.
        </p>

        <p className="text-stone-400 text-xs">
          If you don't see it, check your spam or promotions folder.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailNotice;
