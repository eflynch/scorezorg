'use client';
import { use, useContext } from "react";
import { useRouter } from "next/navigation";
import { LeagueContext } from "@/app/contexts";
import { TabNavigation } from "@/app/components";

export default function SeasonsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { league, updateLeague } = useContext(LeagueContext);
  const router = useRouter();
  const { slug } = use(params);

  const handleDeleteSeason = async (seasonId: string, seasonName: string) => {
    if (!updateLeague) return;

    const confirmMessage = `Are you sure you want to delete the season "${seasonName}"?\n\nThis will:\n- Remove the season from the league\n- Delete ALL matches in this season\n- This action cannot be undone\n\nType "DELETE" to confirm.`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput !== "DELETE") {
      if (userInput !== null) {
        alert('Season deletion cancelled. You must type "DELETE" exactly to confirm.');
      }
      return;
    }

    try {
      await updateLeague((league) => ({
        ...league,
        seasons: league.seasons.filter(season => season.id !== seasonId)
      }));
      
      alert(`Season "${seasonName}" has been successfully deleted.`);
    } catch (error) {
      console.error('Failed to delete season:', error);
      alert('Failed to delete season. Please try again.');
    }
  };

  return (
    <div>
      <TabNavigation slug={slug} />
      <div className="flex px-5 flex-col items-start mt-6">
        <span className="px-5 text-2xl font-bold">Seasons</span>
        {league?.seasons?.map(season => (
          <div key={season.id} className="w-full px-5 py-2 border-b hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => router.push(`/league/${slug}/seasons/${season.id}`)}
                className="flex-1 text-left text-sm hover:text-blue-600 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{season.name}</span>
                  <span className="text-gray-500 text-xs">
                    {season.startDate} - {season.endDate} • {season.matches.length} matches • {season.players.length} players
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleDeleteSeason(season.id, season.name)}
                className="ml-3 px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                title="Delete season"
              >
                Delete
              </button>
            </div>
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
