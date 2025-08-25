'use client';

import { useRouter } from 'next/navigation';
import { useLeagueDb } from "@/app/hooks";

export default function League() {
  const router = useRouter();
  const {leagues} = useLeagueDb();
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 pb-10">
      <h1 className="text-4xl font-bold mb-6">Your Leagues</h1>
      <div className="mb-4">
        {leagues.length === 0 ? (
          <p className="text-gray-600">No leagues found. Create a new league!</p>
        ) : (
          <ul className="list-disc list-inside">
            {leagues.map((league) => (
              <li key={league.key}>
                <a href={`/league/${league.key}`} className="text-blue-600 hover:underline">
                  {league.title}
                </a>
              </li>
            ))}
          </ul>
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
