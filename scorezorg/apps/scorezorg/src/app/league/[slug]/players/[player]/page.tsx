'use client';
import { use, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LeagueContext } from "@/app/contexts";
import { EditBox } from "@/app/components";
import { usePlayerStats } from "@/app/hooks/usePlayerStats";

export default function PlayerPage({ params }: { params: Promise<{ slug: string; player: string }> }) {
  const { league, updateLeague } = useContext(LeagueContext);
  const router = useRouter();
  const { slug: leagueSlug, player: playerSlug } = use(params);
  const { getPlayerRanking } = usePlayerStats(league);

  const player = league?.players.find(p => p.id === playerSlug);
  const playerRanking = getPlayerRanking(playerSlug);
  const playerStats = playerRanking?.stats;

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
        
        {playerStats ? (
          <>
            {/* Overall Performance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{playerStats.totalMatches}</div>
                <div className="text-sm text-gray-600">Total Matches</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{playerStats.wins}</div>
                <div className="text-sm text-gray-600">Wins</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-red-600">{playerStats.losses}</div>
                <div className="text-sm text-gray-600">Losses</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-yellow-600">{playerStats.draws}</div>
                <div className="text-sm text-gray-600">Draws</div>
              </div>
            </div>

            {/* Ranking and Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">#{playerRanking?.rank || 'N/A'}</div>
                <div className="text-sm text-gray-600">League Ranking</div>
                {playerRanking?.rankChange && (
                  <div className={`text-xs mt-1 ${playerRanking.rankChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {playerRanking.rankChange > 0 ? '↗' : '↘'} {Math.abs(playerRanking.rankChange)} from last ranking
                  </div>
                )}
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-indigo-600">{(playerStats.winRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Win Rate</div>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-cyan-600">{playerStats.rankingScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Ranking Score</div>
              </div>
            </div>

            {/* Advanced Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-xl font-bold text-gray-700">{playerStats.averagePointsScored.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Points Scored</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-xl font-bold text-gray-700">{playerStats.pointDifferential > 0 ? '+' : ''}{playerStats.pointDifferential.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Point Differential</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-xl font-bold text-gray-700">
                  {playerStats.currentStreak > 0 && 'W'}
                  {playerStats.currentStreak < 0 && 'L'}
                  {Math.abs(playerStats.currentStreak)}
                </div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-xl font-bold text-gray-700">W{playerStats.winStreak}</div>
                <div className="text-sm text-gray-600">Best Win Streak</div>
              </div>
            </div>

            {/* Activity and Tennis Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg border">
                <div className="text-xl font-bold text-orange-600">{playerStats.seasonsParticipated}</div>
                <div className="text-sm text-gray-600">Seasons</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border">
                <div className="text-xl font-bold text-orange-600">{playerStats.tournamentsParticipated}</div>
                <div className="text-sm text-gray-600">Tournaments</div>
              </div>
              {(playerStats.setsWon > 0 || playerStats.setsLost > 0) && (
                <>
                  <div className="bg-teal-50 p-4 rounded-lg border">
                    <div className="text-xl font-bold text-teal-600">{playerStats.setsWon}-{playerStats.setsLost}</div>
                    <div className="text-sm text-gray-600">Sets Won-Lost</div>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg border">
                    <div className="text-xl font-bold text-teal-600">{playerStats.gamesWon.toFixed(0)}-{playerStats.gamesLost.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Games Won-Lost</div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="text-gray-500 italic">No match statistics available yet</div>
        )}
      </div>

      {/* Seasons Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Seasons ({playerSeasons.length})</h2>
        {playerSeasons.length > 0 ? (
          <div className="space-y-2">
            {playerSeasons.map(season => {
              // Calculate season-specific stats from the season's matches
              let seasonWins = 0;
              let seasonLosses = 0;
              let seasonDraws = 0;
              let seasonMatches = 0;
              
              season.matches.forEach(match => {
                const playerIndex = match.players.findIndex(p => p.id === player.id);
                if (playerIndex !== -1) {
                  seasonMatches++;
                  if (match.winner === playerIndex) {
                    seasonWins++;
                  } else if (match.winner === "draw") {
                    seasonDraws++;
                  } else if (match.winner !== undefined) {
                    seasonLosses++;
                  }
                }
              });
              
              return (
                <div key={season.id} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{season.name}</h3>
                      <p className="text-sm text-gray-600">
                        {season.startDate} to {season.endDate} • {season.matches.length} total matches
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Your stats: {seasonWins}W-{seasonLosses}L-{seasonDraws}D ({seasonMatches} played)
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
                      {bracket.players.length} total players
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


