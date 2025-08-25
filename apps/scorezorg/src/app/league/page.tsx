'use client';

import { useRouter } from 'next/navigation';
import { useLeagueDb } from "@/app/hooks";

export default function League() {
  const router = useRouter();
  const {leagues, removeLeague} = useLeagueDb();

  const handleForgetLeague = async (leagueKey: string, leagueTitle: string) => {
    if (confirm(`Are you sure you want to forget "${leagueTitle}"? This will only remove it from your recent leagues list, not delete the actual league.`)) {
      try {
        await removeLeague(leagueKey);
      } catch (error) {
        console.error('Failed to forget league:', error);
        alert('Failed to forget league. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900">
      <main className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="text-center text-white mb-16">
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Manage your sports leagues, track tournaments, and monitor player statistics
          </p>
        </div>

        {/* Features Grid */}
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

        {/* Leagues Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
          <div className="max-w-4xl mx-auto">
            {leagues.length === 0 ? (
              <div className="text-center">
                <div className="text-6xl mb-6">🏆</div>
                <h3 className="text-2xl font-semibold text-white mb-4">No leagues yet</h3>
                <p className="text-gray-300 text-lg mb-8">Create your first league to get started with organizing tournaments and tracking statistics.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-semibold text-white mb-6 text-center">Recent Leagues</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {leagues.map((league) => (
                    <div key={league.key} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl">🏆</div>
                        <button
                          onClick={() => handleForgetLeague(league.key, league.title)}
                          className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all"
                          title="Forget this league"
                        >
                          ✕
                        </button>
                      </div>
                      <a 
                        href={`/league/${league.key}`} 
                        className="block"
                      >
                        <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">{league.title}</h4>
                        <p className="text-gray-400 text-sm">Click to manage league</p>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center mt-8">
              <button
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => {
                  router.push('/league/new');
                }}
              >
                Create New League
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 py-6 mt-16">
        <div className="max-w-6xl mx-auto px-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Scorezorg. Built with Next.js and Nx.</p>
        </div>
      </footer>
    </div>
  );
}
