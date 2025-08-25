'use client';
import { use, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LeagueContext } from "../../league-context";
import { EditBox } from "../../edit-box";
import { usePlayerSeasonStats } from "@/app/usePlayerStats";
import { League } from "@/app/types";

// Helper function to calculate season stats for a player
const getPlayerSeasonStats = (league: League, playerId: string, seasonId: string) => {
  const stats = {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  };

  const season = league.seasons.find(s => s.id === seasonId);
  if (!season) return stats;

  season.matches.forEach(match => {
    const playerIndex = match.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      stats.matchesPlayed += 1;
      if (match.winner === undefined) {
        // Match not yet played, don't count win/loss/draw
      } else if (match.winner === "draw") {
        stats.draws += 1;
      } else if (match.winner === playerIndex) {
        stats.wins += 1;
      } else {
        stats.losses += 1;
      }
    }
  });

  return stats;
};

export default function PlayerPage({ params }: { params: Promise<{ slug: string; player: string }> }) {
  const { league, updateLeague } = useContext(LeagueContext);
  const router = useRouter();
  const { slug: leagueSlug, player: playerSlug } = use(params);

  const player = league?.players.find(p => p.id === playerSlug);

  // Get overall stats using the existing function
  const overallStats = usePlayerSeasonStats(league || { players: [], seasons: [], brackets: [], slug: '', name: '', createdAt: '', updatedAt: '' }, playerSlug);

  // Find seasons and brackets the player is involved in
  const playerSeasons = useMemo(() => {
    return league?.seasons.filter(season => 
      season.players.includes(player?.id || '')
    ) || [];
  }, [league?.seasons, player?.id]);

  const playerBrackets = useMemo(() => {
    return league?.brackets.filter(bracket => 
      bracket.players.includes(player?.id || '')
    ) || [];
  }, [league?.brackets, player?.id]);

  if (!player) {
    return (
      <div className="p-6">
        <div className="text-red-600 text-lg">Player not found</div>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const updatePlayerName = (newName: string) => {
    updateLeague((league) => ({
      ...league,
      players: league.players.map(p => 
        p.id === player.id ? { ...p, name: newName } : p
      )
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header with player name */}
      <div className="mb-8">
        <button 
          onClick={() => router.push(`/league/${leagueSlug}/players`)}
          className="mb-4 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Players
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-lg text-gray-600">Player:</span>
          <EditBox
            value={player.name}
            onSave={updatePlayerName}
            className="text-3xl font-bold py-2 px-4"
            placeholder="Enter player name"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{overallStats.matchesPlayed}</div>
            <div className="text-sm text-gray-600">Total Matches</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{overallStats.wins}</div>
            <div className="text-sm text-gray-600">Wins</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{overallStats.losses}</div>
            <div className="text-sm text-gray-600">Losses</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">{overallStats.draws}</div>
            <div className="text-sm text-gray-600">Draws</div>
          </div>
        </div>
      </div>

      {/* Seasons Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Seasons ({playerSeasons.length})</h2>
        {playerSeasons.length > 0 ? (
          <div className="space-y-2">
            {playerSeasons.map(season => {
              const seasonStats = league && player ? getPlayerSeasonStats(league, player.id, season.id) : { matchesPlayed: 0, wins: 0, losses: 0, draws: 0 };
              return (
                <div key={season.id} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{season.name}</h3>
                      <p className="text-sm text-gray-600">
                        {season.startDate} to {season.endDate} • {season.matches.length} total matches
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Your stats: {seasonStats.wins}W-{seasonStats.losses}L-{seasonStats.draws}D ({seasonStats.matchesPlayed} played)
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/league/${leagueSlug}/seasons/${season.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Season →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 italic">Not participating in any seasons</div>
        )}
      </div>

      {/* Brackets Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Brackets ({playerBrackets.length})</h2>
        {playerBrackets.length > 0 ? (
          <div className="space-y-2">
            {playerBrackets.map(bracket => (
              <div key={bracket.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{bracket.name}</h3>
                    <p className="text-sm text-gray-600">
                      {bracket.rounds.length} rounds • {bracket.players.length} total players
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/league/${leagueSlug}/brackets`)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Bracket →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">Not participating in any brackets</div>
        )}
      </div>
    </div>
  );
}


