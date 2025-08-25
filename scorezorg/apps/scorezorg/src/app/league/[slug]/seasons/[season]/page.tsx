'use client';
import { use, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LeagueContext } from "@/app/contexts";
import { EditBox } from "@/app/components";
import { Match, Score, TennisScore, SimpleScore } from "@/app/types";
import { Score as ScoreComponent } from "@/app/components";

export default function SeasonPage({ params }: { params: Promise<{ slug: string; season: string }> }) {
  const { league, updateLeague } = useContext(LeagueContext);
  const router = useRouter();
  const { slug: leagueSlug, season: seasonId } = use(params);
  const [numMatches, setNumMatches] = useState(10);

  const season = league?.seasons.find(s => s.id === seasonId);
  
  // Ensure the league has a sport field (for backwards compatibility)
  if (league && league.sport === undefined) {
    updateLeague((league) => ({
      ...league,
      sport: 'simple' as const
    }));
  }
  
  // Get available players not in this season
  const availablePlayers = useMemo(() => {
    if (!league || !season) return [];
    return league.players.filter(player => !season.players.includes(player.id));
  }, [league, season]);

  // Get players in this season
  const seasonPlayers = useMemo(() => {
    if (!league || !season) return [];
    return league.players.filter(player => season.players.includes(player.id));
  }, [league, season]);

  if (!season) {
    return (
      <div className="p-6">
        <div className="text-red-600 text-lg">Season not found</div>
        <button 
          onClick={() => router.push(`/league/${leagueSlug}/seasons`)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Back to Seasons
        </button>
      </div>
    );
  }

  const updateSeasonName = (newName: string) => {
    updateLeague((league) => ({
      ...league,
      seasons: league.seasons.map(s => 
        s.id === season.id ? { ...s, name: newName } : s
      )
    }));
  };

  const updateStartDate = (newDate: string) => {
    updateLeague((league) => ({
      ...league,
      seasons: league.seasons.map(s => 
        s.id === season.id ? { ...s, startDate: newDate } : s
      )
    }));
  };

  const updateEndDate = (newDate: string) => {
    updateLeague((league) => ({
      ...league,
      seasons: league.seasons.map(s => 
        s.id === season.id ? { ...s, endDate: newDate } : s
      )
    }));
  };

  const addPlayerToSeason = (playerId: string) => {
    updateLeague((league) => ({
      ...league,
      seasons: league.seasons.map(s => 
        s.id === season.id ? { ...s, players: [...s.players, playerId] } : s
      )
    }));
  };

  const removePlayerFromSeason = (playerId: string) => {
    updateLeague((league) => ({
      ...league,
      seasons: league.seasons.map(s => 
        s.id === season.id ? { ...s, players: s.players.filter(pid => pid !== playerId) } : s
      )
    }));
  };

  const addMatch = () => {
    if (seasonPlayers.length < 2) {
      alert('You need at least 2 players in the season to create a match');
      return;
    }

    const sport = league?.sport || 'simple';
    const newMatch: Match = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      players: [seasonPlayers[0], seasonPlayers[1]], // Default to first two players
      scores: createDefaultScore(sport),
      winner: "draw"
    };

    updateLeague((league) => ({
      ...league,
      seasons: league.seasons.map(s => 
        s.id === season.id ? { ...s, matches: [...s.matches, newMatch] } : s
      )
    }));
  };

  const updateMatch = (matchId: string, updates: Partial<Match>) => {
    updateLeague((league) => ({
      ...league,
      seasons: league.seasons.map(s => 
        s.id === season.id ? {
          ...s,
          matches: s.matches.map(m => 
            m.id === matchId ? { ...m, ...updates } : m
          )
        } : s
      )
    }));
  };

  const removeMatch = (matchId: string) => {
    updateLeague((league) => ({
      ...league,
      seasons: league.seasons.map(s => 
        s.id === season.id ? {
          ...s,
          matches: s.matches.filter(m => m.id !== matchId)
        } : s
      )
    }));
  };

  const getPlayerName = (playerId: string) => {
    return league?.players.find(p => p.id === playerId)?.name || 'Unknown Player';
  };

  const getWinnerDisplay = (match: Match) => {
    if (match.winner === undefined) return "Not played";
    if (match.winner === "draw") return "Draw";
    if (typeof match.winner === "number" && match.winner < match.players.length) {
      return getPlayerName(match.players[match.winner].id);
    }
    return "Unknown";
  };

  // Helper functions for score handling
  const createDefaultScore = (sport: string): Score => {
    switch (sport) {
      case 'tennis':
        return { sets: [{ games: [0, 0] }] } as TennisScore;
      default:
        return { points: [0, 0] } as SimpleScore;
    }
  };

  const getScoreDisplay = (match: Match): string => {
    if (!match.scores) return "No score";
    
    if ('points' in match.scores) {
      return `${match.scores.points[0] || 0} - ${match.scores.points[1] || 0}`;
    } else if ('sets' in match.scores) {
      return match.scores.sets.map(set => 
        `${set.games[0]}-${set.games[1]}${set.tiebreak ? ` (${set.tiebreak[0]}-${set.tiebreak[1]})` : ''}`
      ).join(', ');
    }
    return "No score";
  };

  const generateMatchSchedule = () => {
    if (seasonPlayers.length < 2) {
      alert('You need at least 2 players in the season to generate a schedule');
      return;
    }

    // Create all possible pairings
    const allPairings: [typeof seasonPlayers[0], typeof seasonPlayers[0]][] = [];
    for (let i = 0; i < seasonPlayers.length; i++) {
      for (let j = i + 1; j < seasonPlayers.length; j++) {
        allPairings.push([seasonPlayers[i], seasonPlayers[j]]);
      }
    }

    // If we have fewer pairings than requested matches, repeat pairings
    const selectedPairings: [typeof seasonPlayers[0], typeof seasonPlayers[0]][] = [];
    
    if (numMatches <= allPairings.length) {
      // Shuffle and take the first numMatches
      const shuffled = [...allPairings].sort(() => Math.random() - 0.5);
      selectedPairings.push(...shuffled.slice(0, numMatches));
    } else {
      // We need more matches than unique pairings, so distribute evenly
      const timesEach = Math.floor(numMatches / allPairings.length);
      const remainder = numMatches % allPairings.length;
      
      // Add each pairing the calculated number of times
      for (let i = 0; i < timesEach; i++) {
        selectedPairings.push(...allPairings.sort(() => Math.random() - 0.5));
      }
      
      // Add remainder randomly
      if (remainder > 0) {
        const shuffled = [...allPairings].sort(() => Math.random() - 0.5);
        selectedPairings.push(...shuffled.slice(0, remainder));
      }
    }

    // Create matches from selected pairings
    const newMatches: Match[] = selectedPairings.map((pairing, index) => ({
      id: String(Date.now() + index),
      date: undefined, // Planned match, no date set yet
      players: pairing,
      scores: undefined, // Planned match, no scores yet
      winner: undefined // Planned match, no winner yet
    }));

    // Shuffle the final matches for better distribution
    const shuffledMatches = newMatches.sort(() => Math.random() - 0.5);

    updateLeague((league) => ({
      ...league,
      seasons: league.seasons.map(s => 
        s.id === season.id ? { ...s, matches: [...s.matches, ...shuffledMatches] } : s
      )
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push(`/league/${leagueSlug}/seasons`)}
          className="mb-4 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Seasons
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-lg text-gray-600">Season:</span>
          <EditBox
            value={season.name}
            onSave={updateSeasonName}
            className="text-3xl font-bold py-2 px-4"
            placeholder="Enter season name"
          />
        </div>

        {/* Date Range and Sport */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <span className="text-lg text-gray-600">Start Date:</span>
          <input
            type="date"
            value={season.startDate}
            onChange={(e) => updateStartDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <span className="text-lg text-gray-600">End Date:</span>
          <input
            type="date"
            value={season.endDate}
            onChange={(e) => updateEndDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <span className="text-lg text-gray-600">Sport:</span>
          <span className="px-3 py-2 bg-gray-100 rounded border text-gray-700 capitalize">
            {league?.sport === 'simple' ? 'Simple Score' : league?.sport || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Players Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Players ({seasonPlayers.length})</h2>
        
        {/* Current Players */}
        <div className="mb-4">
          {seasonPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {seasonPlayers.map(player => (
                <div key={player.id} className="flex items-center justify-between bg-blue-50 p-3 rounded border">
                  <span className="font-medium">{player.name}</span>
                  <button
                    onClick={() => removePlayerFromSeason(player.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">No players in this season</div>
          )}
        </div>

        {/* Add Players */}
        {availablePlayers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Add Players</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {availablePlayers.map(player => (
                <div key={player.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                  <span>{player.name}</span>
                  <button
                    onClick={() => addPlayerToSeason(player.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Matches Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold">Matches ({season.matches.length})</h2>
          
          <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
            {/* Schedule Generator */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Generate:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={numMatches}
                onChange={(e) => setNumMatches(parseInt(e.target.value) || 1)}
                className="w-16 border rounded px-2 py-1 text-center"
              />
              <span className="text-sm text-gray-600">matches</span>
              <button
                onClick={generateMatchSchedule}
                disabled={seasonPlayers.length < 2}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                  seasonPlayers.length >= 2
                    ? 'bg-green-200 text-black hover:bg-green-300'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Generate Schedule
              </button>
            </div>
            
            {/* Manual Add Match */}
            <button
              onClick={addMatch}
              disabled={seasonPlayers.length < 2}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                seasonPlayers.length >= 2
                  ? 'bg-blue-200 text-black hover:bg-blue-300'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add Single Match
            </button>
          </div>
        </div>

        {season.matches.length > 0 ? (
          <div className="space-y-4">
            {season.matches.map(match => (
              <div key={match.id} className="bg-gray-50 p-4 rounded border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Date */}
                  <div>
                    <label className="text-sm text-gray-600">Date:</label>
                    <input
                      type="date"
                      value={match.date || ''}
                      onChange={(e) => updateMatch(match.id, { date: e.target.value })}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>

                  {/* Players and Score */}
                  <div className="md:col-span-2">
                    <div className="space-y-2">
                      {/* Player selectors */}
                      {match.players.map((player, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <select
                            value={player.id}
                            onChange={(e) => {
                              const newPlayers = [...match.players];
                              const selectedPlayer = league?.players.find(p => p.id === e.target.value);
                              if (selectedPlayer) {
                                newPlayers[index] = selectedPlayer;
                                updateMatch(match.id, { players: newPlayers });
                              }
                            }}
                            className="flex-1 border rounded px-2 py-1"
                          >
                            {seasonPlayers.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                      
                      {/* Score Component */}
                      <div className="mt-2">
                        <ScoreComponent
                          score={match.scores}
                          onScoreChange={(newScore) => updateMatch(match.id, { scores: newScore })}
                          sport={league?.sport || 'simple'}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Winner and Actions */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-600">Winner:</label>
                      <select
                        value={(()=>{
                            if (match.winner === "draw") {
                                return "draw";
                            } else if (match.winner === undefined) {
                                return "";
                            } else {
                                return "player-" + match.winner;
                            }
                        })()}
                        onChange={(e) => {
                            if (e.target.value === "draw") {
                                updateMatch(match.id, { winner: "draw" });
                            } else if (e.target.value === "") {
                                updateMatch(match.id, { winner: undefined });
                            } else if (e.target.value.startsWith("player-")) {
                                const playerIndex = parseInt(e.target.value.split("-")[1]);
                                updateMatch(match.id, { winner: playerIndex });
                            }
                        }}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Not played</option>
                        <option value="draw">Draw</option>
                        {match.players.map((player, index) => (
                          <option key={index} value={"player-"+index}>{getPlayerName(player.id)}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeMatch(match.id)}
                      className="w-full text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete Match
                    </button>
                  </div>
                </div>
                
                {/* Match Result Display */}
                <div className="mt-2 pt-2 border-t text-sm text-gray-600">
                  {match.winner !== undefined ? (
                    <>
                      <strong>Result:</strong> {getPlayerName(match.players[0].id)} vs {getPlayerName(match.players[1].id)}
                      {match.scores && (
                        <span> - {getScoreDisplay(match)}</span>
                      )}
                      <span className="ml-2 font-semibold">Winner: {getWinnerDisplay(match)}</span>
                    </>
                  ) : (
                    <span className="italic">Match not yet played</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">No matches played yet</div>
        )}
      </div>
    </div>
  );
}