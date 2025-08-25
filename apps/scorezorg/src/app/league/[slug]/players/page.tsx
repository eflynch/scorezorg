'use client';
import { use, useContext, useState } from "react";
import { LeagueContext } from "@/app/contexts";
import { TabNavigation } from "@/app/components";
import { usePlayerStats } from "@/app/hooks";
import { BracketMatch } from "@/app/types";

export default function PlayersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { league, updateLeague} = useContext(LeagueContext);
  const { slug } = use(params);
  const [showRankings, setShowRankings] = useState(false);
  const { playerRankings, hasData } = usePlayerStats(league);

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!updateLeague) return;

    const confirmMessage = `Are you sure you want to delete "${playerName}"?\n\nThis will:\n- Remove the player from the league\n- Remove all their match history from seasons\n- Remove them from all brackets and tournament seedings\n- Remove any bracket matches they participated in\n- This action cannot be undone\n\nType "DELETE" to confirm.`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput !== "DELETE") {
      if (userInput !== null) {
        alert('Player deletion cancelled. You must type "DELETE" exactly to confirm.');
      }
      return;
    }

    // Helper function to recursively remove player from bracket matches
    const removeBracketMatches = (bracketMatch?: BracketMatch): BracketMatch | undefined => {
      if (!bracketMatch) return undefined;
      
      // Check if this match contains the player being deleted
      const matchContainsPlayer = bracketMatch.match?.players?.some(player => player.id === playerId);
      
      // If this match contains the player, remove the entire match
      if (matchContainsPlayer) {
        return undefined;
      }
      
      // Recursively process children
      const newMatch = { ...bracketMatch };
      if (bracketMatch.children) {
        const leftChild = removeBracketMatches(bracketMatch.children[0]);
        const rightChild = removeBracketMatches(bracketMatch.children[1]);
        
        // If both children are removed, remove this match too
        if (!leftChild && !rightChild) {
          return undefined;
        }
        
        // Update children array, filtering out undefined values
        const newChildren = [leftChild, rightChild].filter(child => child !== undefined);
        if (newChildren.length === 2) {
          newMatch.children = newChildren as [BracketMatch, BracketMatch];
        } else if (newChildren.length === 1) {
          // If only one child remains, we might want to restructure or handle this case
          // For now, we'll keep the match but without children
          delete newMatch.children;
        } else {
          delete newMatch.children;
        }
      }
      
      return newMatch;
    };

    try {
      await updateLeague((league) => ({
        ...league,
        players: league.players.filter(player => player.id !== playerId),
        // Remove from all seasons and matches
        seasons: league.seasons.map(season => ({
          ...season,
          matches: season.matches.filter(match => 
            !match.players.some(player => player.id === playerId)
          )
        })),
        // Remove from all brackets
        brackets: league.brackets.map(bracket => ({
          ...bracket,
          // Remove from bracket players list
          players: bracket.players.filter(id => id !== playerId),
          // Remove from seedings
          seedings: bracket.seedings.filter(seeding => seeding.playerId !== playerId),
          // Remove from bracket matches
          finalMatch: removeBracketMatches(bracket.finalMatch)
        }))
      }));
      
      alert(`Player "${playerName}" has been successfully deleted.`);
    } catch (error) {
      console.error('Failed to delete player:', error);
      alert('Failed to delete player. Please try again.');
    }
  };

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
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
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
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeletePlayer(ranking.stats.playerId, ranking.stats.playerName)}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete player"
                        >
                          Delete
                        </button>
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
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
                    <button
                      onClick={() => handleDeletePlayer(player.id, player.name)}
                      className="ml-2 px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="Delete player"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-5 mt-6">
          <button 
            className="px-4 py-2 text-black bg-blue-200 rounded hover:bg-blue-300 transition-colors text-sm font-semibold shadow" 
            onClick={() => {
              if (!updateLeague) return;
              updateLeague((league) => ({
                ...league, 
                players: [...league.players, { 
                  id: String(Date.now()), 
                  name: 'New Player' 
                }] 
              }));
            }}
          >
            Add Player
          </button>
        </div>
      </div>
    </div>
  );
}
