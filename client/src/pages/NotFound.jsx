import React from 'react';
import { Link } from 'react-router-dom';
import { Frown } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-orange-50 p-4 rounded-full text-pizza-500 mb-6">
        <Frown className="h-16 w-16 animate-bounce" />
      </div>
      <h1 className="text-4xl font-extrabold text-stone-900 mb-2">404</h1>
      <h2 className="text-xl font-bold text-stone-800 mb-2">Page Not Found</h2>
      <p className="text-stone-600 max-w-md mb-8">
        We couldn't find the page you're looking for. It might have been moved, deleted, or eaten.
      </p>
      <Link
        to="/"
        className="pizza-gradient hover:pizza-gradient-hover text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
