'use client';

import { useEffect } from 'react';

export default function Index() {
  useEffect(() => {
    // Redirect to league page after a brief moment to show the landing content
    const timer = setTimeout(() => {
      window.location.href = '/league';
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900">
      <header className="bg-gray-900/80 backdrop-blur-sm text-white px-8 py-6 shadow-xl border-b border-gray-700">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold tracking-wide bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Scorezorg
          </h1>
          <p className="text-gray-300 mt-2 text-lg">Sports League Management Platform</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center text-white mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome to Scorezorg
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The modern platform for organizing sports leagues, managing tournaments, 
            and tracking player statistics. Built for competitive communities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-white mb-3">League Management</h3>
            <p className="text-gray-300">Create and manage multiple sports leagues with comprehensive administrative tools.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-3">Player Statistics</h3>
            <p className="text-gray-300">Track detailed player performance, rankings, and statistics across seasons.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-3">Tournament Brackets</h3>
            <p className="text-gray-300">Organize and visualize tournament structures with real-time bracket updates.</p>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            Redirecting to leagues...
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 w-full bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 py-4">
        <div className="max-w-6xl mx-auto px-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Scorezorg. Built with Next.js and Nx.</p>
        </div>
      </footer>
    </div>
  );
}
