import React from 'react';

export default function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{message}</p>
    </div>
  );
}
