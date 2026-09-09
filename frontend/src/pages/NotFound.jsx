import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lagoon-100 text-lagoon-600">
        <Compass size={30} />
      </span>
      <h1 className="mt-6 font-display text-5xl font-semibold text-lagoon-900">404</h1>
      <p className="mt-3 text-lg font-semibold text-lagoon-800">Looks like this trail doesn&apos;t exist</p>
      <p className="mt-2 text-sm text-lagoon-500">
        The page you&apos;re looking for may have moved or the tour may no longer be available.
      </p>
      <Link to="/" className="btn-primary mt-7">
        <Home size={16} /> Back to Home
      </Link>
    </div>
  );
}
