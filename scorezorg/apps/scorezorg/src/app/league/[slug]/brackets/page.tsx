'use client';
import { use, useContext } from "react";
import { useRouter } from "next/navigation";
import { LeagueContext } from "../league-context";
import TabNavigation from "../tab-navigation";

export default function BracketsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { league, updateLeague } = useContext(LeagueContext);
  const router = useRouter();
  const { slug } = use(params);

  return (
    <div>
      <TabNavigation slug={slug} />
      <div className="flex px-5 flex-col items-start mt-6">
        <span className="px-5 text-2xl font-bold">Brackets</span>
        {league?.brackets?.map(bracket => (
          <div key={bracket.id} className="w-full px-5 py-2 border-b hover:bg-gray-50 transition-colors">
            <button 
              onClick={() => router.push(`/league/${slug}/brackets/${bracket.id}`)}
              className="w-full text-left text-sm hover:text-blue-600 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{bracket.name}</span>
                <span className="text-gray-500 text-xs">
                  {bracket.rounds?.length || 0} rounds • {bracket.players.length} players
                </span>
              </div>
            </button>
          </div>
        ))}
        <button 
          className="px-5 text-black bg-blue-200 rounded hover:bg-blue-300 transition-colors text-sm font-semibold shadow px-2 mt-2" 
          onClick={() => updateLeague((league) => ({
            ...league, 
            brackets: [...(league.brackets || []), {
                id: String(Date.now()),
                name: 'New Bracket',
                rounds: [],
                players: league.players.map(p => p.id), // Initialize with all league players
                seedings: []
            }] 
          }))}
        >
          Add Bracket
        </button>
      </div>
    </div>
  );
}
