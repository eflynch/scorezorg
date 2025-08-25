'use client';

import { useEffect } from 'react';

export default function Index() {
  useEffect(() => {
    // Immediate redirect to league page
    window.location.href = '/league';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="inline-flex items-center gap-3 text-gray-300">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          <span className="text-lg">Redirecting to Scorezorg...</span>
        </div>
      </div>
    </div>
  );
}
