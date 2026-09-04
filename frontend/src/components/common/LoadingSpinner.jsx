import React from 'react';
import { Compass } from 'lucide-react';

const SIZES = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function LoadingSpinner({ size = 'md', label = 'Loading', fullPage = false }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3 text-lagoon-500">
      <Compass className={`${SIZES[size]} animate-spin`} strokeWidth={1.75} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[50vh] w-full items-center justify-center">{spinner}</div>;
  }
  return spinner;
}
