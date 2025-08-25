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
    <div className="flex flex-col items-center justify-center bg-gray-100 pb-10">
      <h1 className="text-4xl font-bold mb-6">Your Leagues</h1>
      <div className="mb-4 w-full max-w-md">
        {leagues.length === 0 ? (
          <p className="text-gray-600 text-center">No leagues found. Create a new league!</p>
        ) : (
          <div className="space-y-2">
            {leagues.map((league) => (
              <div key={league.key} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border">
                <a 
                  href={`/league/${league.key}`} 
                  className="text-blue-600 hover:underline font-medium flex-1"
                >
                  {league.title}
                </a>
                <button
                  onClick={() => handleForgetLeague(league.key, league.title)}
                  className="ml-3 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Forget this league"
                >
                  Forget
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold shadow"
        onClick={() => {
          router.push('/league/new');
        }}
      >
        Create League
      </button>
    </div>
  );
}
