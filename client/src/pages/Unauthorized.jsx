import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-rose-50 p-4 rounded-full text-rose-600 mb-6">
        <ShieldAlert className="h-16 w-16" />
      </div>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Access Denied</h1>
      <p className="text-stone-600 max-w-md mb-8">
        You do not have the required permissions to access this administrative resource.
      </p>
      <Link
        to="/"
        className="bg-stone-900 hover:bg-stone-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default Unauthorized;
