'use client';
import update from 'immutability-helper';
import { use, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LeagueContext } from "../../league-context";
import { EditBox } from "../../edit-box";
import { Match, BracketMatch } from "@/app/types";

export default function BracketPage({ params }: { params: Promise<{ slug: string; bracket: string }> }) {
  const { league, updateLeague } = useContext(LeagueContext);
  const router = useRouter();
  const { slug: leagueSlug, bracket: bracketId } = use(params);

  const bracket = league?.brackets.find(b => b.id === bracketId);
  
  // Get available players not in this bracket
  const availablePlayers = useMemo(() => {
    if (!league || !bracket) return [];
    return league.players.filter(player => !bracket.players.includes(player.id));
  }, [league, bracket]);

  // Get players in this bracket
  const bracketPlayers = useMemo(() => {
    if (!league || !bracket) return [];
    return league.players.filter(player => bracket.players.includes(player.id));
  }, [league, bracket]);

  if (!bracket) {
    return (
      <div className="p-6">
        <div className="text-red-600 text-lg">Bracket not found</div>
        <button 
          onClick={() => router.push(`/league/${leagueSlug}/brackets`)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Back to Brackets
        </button>
      </div>
    );
  }

  const updateBracketName = (newName: string) => {
    updateLeague((league) => update(league, {
      brackets: {
        [league.brackets.findIndex(b => b.id === bracket.id)]: {
          name: { $set: newName }
        }
      }
    }));
  };

  const addPlayerToBracket = (playerId: string) => {
    updateLeague((league) => update(league, {
      brackets: {
        [league.brackets.findIndex(b => b.id === bracket.id)]: {
          players: { $push: [playerId] }
        }
      }
    }));
  };

  const removePlayerFromBracket = (playerId: string) => {
    updateLeague((league) => update(league, {
      brackets: {
        [league.brackets.findIndex(b => b.id === bracket.id)]: {
          players: { $apply: (players: string[]) => players.filter(pid => pid !== playerId) }
        }
      }
    }));
  };

  const updateMatch = (matchId: string, winner: number | "draw" | undefined) => {
    const updateBracketMatch = (bracketMatch: BracketMatch): BracketMatch => {
      if (bracketMatch.match.id === matchId) {
        // Update the current match winner
        return update(bracketMatch, {
          match: {
            winner: { $set: winner }
          }
        });
      }
      
      if (bracketMatch.children) {
        const [leftChild, rightChild] = bracketMatch.children;
        
        // Recursively update children
        const updatedLeftChild = updateBracketMatch(leftChild);
        const updatedRightChild = updateBracketMatch(rightChild);
        
        // Check if either child was updated (contains our target match)
        const leftChildUpdated = updatedLeftChild !== leftChild;
        const rightChildUpdated = updatedRightChild !== rightChild;
        
        if (leftChildUpdated || rightChildUpdated) {
          // Determine the new players for this match based on child winners
          const leftWinner = updatedLeftChild.match.winner;
          const rightWinner = updatedRightChild.match.winner;
          
          const leftPlayer = leftWinner !== undefined && leftWinner !== "draw"
            ? updatedLeftChild.match.players[leftWinner]
            : { id: 'tbd', name: 'TBD' };
            
          const rightPlayer = rightWinner !== undefined && rightWinner !== "draw"
            ? updatedRightChild.match.players[rightWinner]
            : { id: 'tbd', name: 'TBD' };
          
          // Check for automatic advancement when facing BYEs
          let autoWinner: number | "draw" | undefined = undefined;
          if (leftPlayer.id.startsWith('bye-') && rightPlayer.id.startsWith('bye-')) {
            // Both are byes, first one wins by default
            autoWinner = 0;
          } else if (leftPlayer.id.startsWith('bye-') && !rightPlayer.id.startsWith('bye-')) {
            // Left is bye, right player wins
            autoWinner = 1;
          } else if (!leftPlayer.id.startsWith('bye-') && rightPlayer.id.startsWith('bye-')) {
            // Right is bye, left player wins
            autoWinner = 0;
          }
          
          // Update this match with new children and players
          return update(bracketMatch, {
            children: { $set: [updatedLeftChild, updatedRightChild] },
            match: {
              players: { $set: [leftPlayer, rightPlayer] },
              winner: { $set: autoWinner } // Set auto winner if facing BYE, otherwise clear
            }
          });
        }
      }
      
      return bracketMatch;
    };

    updateLeague((league) => update(league, {
      brackets: {
        [league.brackets.findIndex(b => b.id === bracket.id)]: {
          finalMatch: { $apply: (finalMatch: BracketMatch | undefined) => 
            finalMatch ? updateBracketMatch(finalMatch) : finalMatch
          }
        }
      }
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

  // Tournament generation logic
  const generateTournament = () => {
    if (bracketPlayers.length < 2) {
      alert('You need at least 2 players to generate a tournament');
      return;
    }

    if (bracket.finalMatch) {
      const confirmRegenerate = confirm('This will replace the existing tournament. Are you sure?');
      if (!confirmRegenerate) return;
    }

    // Calculate the next power of 2
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(bracketPlayers.length)));
    
    // Shuffle players for random seeding
    const shuffledPlayers = [...bracketPlayers].sort(() => Math.random() - 0.5);
    
    // Create seedings
    const seedings = shuffledPlayers.map((player, index) => ({
      playerId: player.id,
      seed: index + 1
    }));

    // Pad with "bye" players if needed
    const playersWithByes = [...shuffledPlayers];
    while (playersWithByes.length < nextPowerOf2) {
      playersWithByes.push({ id: `bye-${playersWithByes.length}`, name: 'BYE' });
    }

    // Build the tournament tree from bottom up
    const finalMatch = buildTournamentTree(playersWithByes, 1);

    // Update the bracket
    updateLeague((league) => update(league, {
      brackets: {
        [league.brackets.findIndex(b => b.id === bracket.id)]: {
          finalMatch: { $set: finalMatch },
          seedings: { $set: seedings }
        }
      }
    }));
  };

  const buildTournamentTree = (players: typeof bracketPlayers, round: number): BracketMatch => {
    if (players.length === 2) {
      // Base case: create a leaf match
      const player1 = players[0];
      const player2 = players[1];
      
      // If one player is a bye, automatically advance the other
      let winner: number | "draw" | undefined = undefined;
      if (player1.id.startsWith('bye-')) {
        winner = 1; // Player 2 wins
      } else if (player2.id.startsWith('bye-')) {
        winner = 0; // Player 1 wins
      }

      return {
        id: `match-${round}-${Math.floor(Math.random() * 10000)}`,
        match: {
          id: `match-${round}-${Math.floor(Math.random() * 10000)}`,
          players: [player1, player2],
          date: undefined,
          scores: undefined,
          winner
        },
        round,
        position: 0
      };
    }

    // Recursive case: split players and create child matches
    const mid = players.length / 2;
    const leftPlayers = players.slice(0, mid);
    const rightPlayers = players.slice(mid);

    const leftChild = buildTournamentTree(leftPlayers, round);
    const rightChild = buildTournamentTree(rightPlayers, round);

    // Determine players for this match based on child winners
    const leftWinner = leftChild.match.winner;
    const rightWinner = rightChild.match.winner;
    
    const leftPlayer = leftWinner !== undefined && leftWinner !== "draw"
      ? leftChild.match.players[leftWinner]
      : { id: 'tbd', name: 'TBD' };
      
    const rightPlayer = rightWinner !== undefined && rightWinner !== "draw"
      ? rightChild.match.players[rightWinner]
      : { id: 'tbd', name: 'TBD' };

    // Check for automatic advancement when facing BYEs
    let autoWinner: number | "draw" | undefined = undefined;
    if (leftPlayer.id.startsWith('bye-') && rightPlayer.id.startsWith('bye-')) {
      // Both are byes, first one wins by default
      autoWinner = 0;
    } else if (leftPlayer.id.startsWith('bye-') && !rightPlayer.id.startsWith('bye-')) {
      // Left is bye, right player wins
      autoWinner = 1;
    } else if (!leftPlayer.id.startsWith('bye-') && rightPlayer.id.startsWith('bye-')) {
      // Right is bye, left player wins
      autoWinner = 0;
    }

    return {
      id: `match-${round + Math.log2(players.length) - 1}-${Math.floor(Math.random() * 10000)}`,
      match: {
        id: `match-${round + Math.log2(players.length) - 1}-${Math.floor(Math.random() * 10000)}`,
        players: [leftPlayer, rightPlayer],
        date: undefined,
        scores: undefined,
        winner: autoWinner
      },
      children: [leftChild, rightChild],
      round: round + Math.log2(players.length) - 1,
      position: 0
    };
  };

  // Helper functions for tree traversal and display
  const getAllMatchesByRound = (bracketMatch: BracketMatch | undefined): { [round: number]: BracketMatch[] } => {
    if (!bracketMatch) return {};
    
    const matchesByRound: { [round: number]: BracketMatch[] } = {};
    
    const traverse = (match: BracketMatch) => {
      if (!matchesByRound[match.round]) {
        matchesByRound[match.round] = [];
      }
      matchesByRound[match.round].push(match);
      
      if (match.children) {
        traverse(match.children[0]);
        traverse(match.children[1]);
      }
    };
    
    traverse(bracketMatch);
    return matchesByRound;
  };

  const getRoundName = (roundNumber: number, totalRounds: number) => {
    const roundsFromEnd = totalRounds - roundNumber + 1;
    
    if (roundsFromEnd === 1) return "Final";
    if (roundsFromEnd === 2) return "Semifinals";
    if (roundsFromEnd === 3) return "Quarterfinals";
    if (roundsFromEnd === 4) return "Round of 16";
    if (roundsFromEnd === 5) return "Round of 32";
    
    return `Round ${roundNumber}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push(`/league/${leagueSlug}/brackets`)}
          className="mb-4 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Brackets
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-lg text-gray-600">Bracket:</span>
          <EditBox
            value={bracket.name}
            onSave={updateBracketName}
            className="text-3xl font-bold py-2 px-4"
            placeholder="Enter bracket name"
          />
        </div>
      </div>

      {/* Players Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Players ({bracketPlayers.length})</h2>
        
        {/* Current Players */}
        <div className="mb-4">
          {bracketPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {bracketPlayers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between bg-blue-50 p-3 rounded border">
                  <span className="font-medium">
                    {player.name}
                    {bracket.seedings.length > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        (#{bracket.seedings.find(s => s.playerId === player.id)?.seed || 'N/A'})
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => removePlayerFromBracket(player.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    disabled={bracket.finalMatch !== undefined}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">No players in this bracket</div>
          )}
        </div>

        {/* Add Players */}
        {availablePlayers.length > 0 && !bracket.finalMatch && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Add Players</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {availablePlayers.map(player => (
                <div key={player.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                  <span>{player.name}</span>
                  <button
                    onClick={() => addPlayerToBracket(player.id)}
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

      {/* Tournament Generation */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tournament</h2>
          {!bracket.finalMatch ? (
            <button
              onClick={generateTournament}
              disabled={bracketPlayers.length < 2}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                bracketPlayers.length >= 2
                  ? 'bg-green-200 text-black hover:bg-green-300'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Generate Tournament
            </button>
          ) : (
            <button
              onClick={generateTournament}
              className="px-4 py-2 rounded font-semibold transition-colors bg-yellow-200 text-black hover:bg-yellow-300"
            >
              Regenerate Tournament
            </button>
          )}
        </div>

        {bracket.finalMatch ? (
          <div className="space-y-8">
            {Object.entries(getAllMatchesByRound(bracket.finalMatch))
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([roundNum, matches]) => (
                <div key={roundNum} className="border rounded-lg p-4">
                  <h3 className="text-xl font-bold mb-4">
                    {getRoundName(parseInt(roundNum), Math.max(...Object.keys(getAllMatchesByRound(bracket.finalMatch)).map(r => parseInt(r))))}
                  </h3>
                  <div className="space-y-4">
                    {matches.map((bracketMatch) => (
                      <div key={bracketMatch.id} className="bg-gray-50 p-4 rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          {/* Players */}
                          <div className="md:col-span-2">
                            <div className="space-y-2">
                              {bracketMatch.match.players.map((player, playerIndex) => (
                                <div key={playerIndex} className="flex items-center justify-between bg-white p-2 rounded">
                                  <span className={`font-medium ${player.id === 'tbd' ? 'text-gray-400 italic' : ''}`}>
                                    {player.name}
                                  </span>
                                  {bracketMatch.match.winner === playerIndex && (
                                    <span className="text-green-600 font-bold">WINNER</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Winner Selection */}
                          <div>
                            <label className="text-sm text-gray-600">Winner:</label>
                            <select
                              value={bracketMatch.match.winner !== undefined ? 
                                (bracketMatch.match.winner === "draw" ? "draw" : `player-${bracketMatch.match.winner}`) : 
                                ""
                              }
                              onChange={(e) => {
                                let winner: number | "draw" | undefined;
                                if (e.target.value === "draw") {
                                  winner = "draw";
                                } else if (e.target.value === "") {
                                  winner = undefined;
                                } else if (e.target.value.startsWith("player-")) {
                                  winner = parseInt(e.target.value.split("-")[1]);
                                }
                                
                                // Update the current match (no advancement logic for now)
                                updateMatch(bracketMatch.match.id, winner);
                              }}
                              className="w-full border rounded px-2 py-1"
                              disabled={bracketMatch.match.players.some(p => p.id === 'tbd')}
                            >
                              <option value="">Not played</option>
                              <option value="draw">Draw</option>
                              {bracketMatch.match.players.map((player, index) => (
                                <option 
                                  key={index} 
                                  value={`player-${index}`}
                                  disabled={player.id === 'tbd'}
                                >
                                  {player.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        {/* Match Result Display */}
                        <div className="mt-2 pt-2 border-t text-sm text-gray-600">
                          <strong>Status:</strong> {getWinnerDisplay(bracketMatch.match)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">No tournament generated yet</div>
        )}
      </div>
    </div>
  );
}
