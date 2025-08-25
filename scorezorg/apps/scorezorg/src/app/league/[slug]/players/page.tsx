'use client';
import { use, useContext, useState } from "react";
import { LeagueContext } from "@/app/contexts";
import { TabNavigation } from "@/app/components";
import { usePlayerStats } from "@/app/hooks/usePlayerStats";

export default function PlayersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { league, updateLeague} = useContext(LeagueContext);
  const { slug } = use(params);
  const [showRankings, setShowRankings] = useState(false);
  const { playerRankings, hasData } = usePlayerStats(league);

  return (
    <div>
      <TabNavigation slug={slug} />
      <div className="flex px-5 flex-col items-start mt-6">
        <div className="flex justify-between items-center w-full px-5 mb-4">
          <span className="text-2xl font-bold">Players</span>
          {hasData && (
            <button
              onClick={() => setShowRankings(!showRankings)}
              className="px-3 py-1 bg-green-200 text-black rounded hover:bg-green-300 transition-colors text-sm font-semibold"
            >
              {showRankings ? 'Show List' : 'Show Rankings'}
            </button>
          )}
        </div>

        {showRankings && hasData ? (
          <div className="w-full px-5">
            <h3 className="text-lg font-semibold mb-4">Player Rankings</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Player</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Matches</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Win Rate</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {playerRankings.map((ranking) => (
                    <tr key={ranking.stats.playerId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="font-medium text-lg">#{ranking.rank}</span>
                          {ranking.rankChange && (
                            <span className={`ml-2 text-xs ${ranking.rankChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {ranking.rankChange > 0 ? '↗' : '↘'} {Math.abs(ranking.rankChange)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/league/${slug}/players/${ranking.stats.playerId}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {ranking.stats.playerName}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <div>{ranking.stats.totalMatches} played</div>
                          <div className="text-xs text-gray-500">
                            {ranking.stats.wins}W-{ranking.stats.losses}L-{ranking.stats.draws}D
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium">{(ranking.stats.winRate * 100).toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">
                            {ranking.stats.pointDifferential > 0 ? '+' : ''}{ranking.stats.pointDifferential.toFixed(1)} pts
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {ranking.stats.rankingScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className={`font-medium ${
                          ranking.stats.currentStreak > 0 ? 'text-green-600' : 
                          ranking.stats.currentStreak < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {ranking.stats.currentStreak > 0 && 'W'}
                          {ranking.stats.currentStreak < 0 && 'L'}
                          {Math.abs(ranking.stats.currentStreak)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Best: W{ranking.stats.winStreak}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="w-full px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {league?.players.map(player => (
                <div key={player.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                  <a
                    href={`/league/${slug}/players/${player.id}`}
                    className="text-lg font-medium text-blue-600 hover:text-blue-800"
                  >
                    {player.name}
                  </a>
                  {hasData && (
                    <div className="mt-2 text-sm text-gray-600">
                      {(() => {
                        const playerRanking = playerRankings.find(r => r.stats.playerId === player.id);
                        if (!playerRanking) return <span>No matches yet</span>;
                        return (
                          <div>
                            <div>Rank #{playerRanking.rank}</div>
                            <div>{playerRanking.stats.totalMatches} matches • {(playerRanking.stats.winRate * 100).toFixed(1)}% win rate</div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-5 mt-6">
          <button 
            className="px-4 py-2 text-black bg-blue-200 rounded hover:bg-blue-300 transition-colors text-sm font-semibold shadow" 
            onClick={() => updateLeague((league) => ({
              ...league, 
              players: [...league.players, { 
                id: String(Date.now()), 
                name: 'New Player' 
              }] 
            }))}
          >
            Add Player
          </button>
        </div>
      </div>
    </div>
  );
}
