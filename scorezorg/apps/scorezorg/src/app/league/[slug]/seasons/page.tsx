'use client';
import { use, useContext } from "react";
import { useRouter } from "next/navigation";
import { LeagueContext } from "@/app/contexts";
import { TabNavigation } from "@/app/components";

export default function SeasonsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { league, updateLeague } = useContext(LeagueContext);
  const router = useRouter();
  const { slug } = use(params);

  return (
    <div>
      <TabNavigation slug={slug} />
      <div className="flex px-5 flex-col items-start mt-6">
        <span className="px-5 text-2xl font-bold">Seasons</span>
        {league?.seasons?.map(season => (
          <div key={season.id} className="w-full px-5 py-2 border-b hover:bg-gray-50 transition-colors">
            <button 
              onClick={() => router.push(`/league/${slug}/seasons/${season.id}`)}
              className="w-full text-left text-sm hover:text-blue-600 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{season.name}</span>
                <span className="text-gray-500 text-xs">
                  {season.startDate} - {season.endDate} • {season.matches.length} matches • {season.players.length} players
                </span>
              </div>
            </button>
          </div>
        ))}
        <button 
          className="px-5 text-black bg-blue-200 rounded hover:bg-blue-300 transition-colors text-sm font-semibold shadow px-2 mt-2" 
          onClick={() => {
            if (!updateLeague) return;
            updateLeague((league) => ({
              ...league, 
              seasons: [...(league.seasons || []), {
                  id: String(Date.now()),
                  name: 'New Season',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0],
                  matches: [],
                  players: league.players.map(p => p.id) // Initialize with all league players
                  ,
              }] 
            }));
          }}
        >
          Add Season
        </button>
      </div>
    </div>
  );
}
