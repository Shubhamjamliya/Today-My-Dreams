import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-start pt-4 min-h-fill bg-gray-100 text-center">
      <div className="w-full max-w-md p-8">
        <div className="mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className=" h-48 w-48 mx-auto text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M12 11v-1"></path>
            <path d="M12 15h.01"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
