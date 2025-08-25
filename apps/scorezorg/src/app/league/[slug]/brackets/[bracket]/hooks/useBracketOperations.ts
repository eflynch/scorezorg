import update from 'immutability-helper';
import { useContext } from 'react';
import { LeagueContext } from '@/app/contexts';
import { BracketMatch, Player, Score } from '@/app/types';
import { usePlayerStats } from '@/app/hooks';

export const useBracketOperations = (bracketId: string) => {
  const { league, updateLeague } = useContext(LeagueContext);
  const { playerRankings } = usePlayerStats(league);
  const bracket = league?.brackets.find(b => b.id === bracketId);

  const updateBracketName = (newName: string) => {
    if (!updateLeague) return;
    updateLeague((league) => update(league, {
      brackets: {
        [league.brackets.findIndex(b => b.id === bracketId)]: {
          name: { $set: newName }
        }
      }
    }));
  };

  const addPlayerToBracket = (playerId: string) => {
    if (!updateLeague) return;
    updateLeague((league) => update(league, {
      brackets: {
        [league.brackets.findIndex(b => b.id === bracketId)]: {
          players: { $push: [playerId] }
        }
      }
    }));
  };

  const removePlayerFromBracket = (playerId: string) => {
    if (!updateLeague) return;
    updateLeague((league) => update(league, {
      brackets: {
        [league.brackets.findIndex(b => b.id === bracketId)]: {
          players: { $apply: (players: string[]) => players.filter(pid => pid !== playerId) }
        }
      }
    }));
  };

  const updateMatch = (matchId: string, winner: number | "draw" | undefined, score?: Score) => {
    const updateBracketMatch = (bracketMatch: BracketMatch): BracketMatch => {
      if (bracketMatch.match.id === matchId) {
        // Update the current match winner and score
        const updates = {
          match: {
            winner: { $set: winner },
            ...(score !== undefined && { scores: { $set: score } })
          }
        };
        
        return update(bracketMatch, updates);
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

    if (!updateLeague) return;
    updateLeague((league) => update(league, {
      brackets: {
        [league.brackets.findIndex(b => b.id === bracketId)]: {
          finalMatch: { $apply: (finalMatch: BracketMatch | undefined) => 
            finalMatch ? updateBracketMatch(finalMatch) : finalMatch
          }
        }
      }
    }));
  };

  const generateTournament = (bracketPlayers: Player[]) => {
    if (!updateLeague) return;
    
    if (bracketPlayers.length < 2) {
      alert('You need at least 2 players to generate a tournament');
      return;
    }

    if (bracket?.finalMatch) {
      const confirmRegenerate = confirm('This will replace the existing tournament. Are you sure?');
      if (!confirmRegenerate) return;
    }

    // Calculate the next power of 2
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(bracketPlayers.length)));
    
    // Sort players by current ranking (best players get lowest seed numbers)
    const rankedPlayers = [...bracketPlayers].sort((a, b) => {
      const aRanking = playerRankings.find(r => r.stats.playerId === a.id);
      const bRanking = playerRankings.find(r => r.stats.playerId === b.id);
      
      // If both players have rankings, sort by rank (lower rank number = better)
      if (aRanking && bRanking) {
        return aRanking.rank - bRanking.rank;
      }
      
      // Players with rankings come before players without rankings
      if (aRanking && !bRanking) return -1;
      if (!aRanking && bRanking) return 1;
      
      // If neither has rankings, maintain original order
      return 0;
    });
    
    // Create seedings based on ranking
    const seedings = rankedPlayers.map((player, index) => ({
      playerId: player.id,
      seed: index + 1
    }));

    // Apply proper tournament seeding order (1 vs 8, 2 vs 7, 3 vs 6, 4 vs 5 in an 8-player bracket)
    const seededPlayers = applyTournamentSeeding(rankedPlayers);

    // Pad with "bye" players if needed
    const playersWithByes = [...seededPlayers];
    while (playersWithByes.length < nextPowerOf2) {
      playersWithByes.push({ id: `bye-${playersWithByes.length}`, name: 'BYE' });
    }

    // Build the tournament tree from bottom up
    const finalMatch = buildTournamentTree(playersWithByes, 1);

    // Update the bracket
    updateLeague((league) => update(league, {
      brackets: {
        [league.brackets.findIndex(b => b.id === bracketId)]: {
          finalMatch: { $set: finalMatch },
          seedings: { $set: seedings }
        }
      }
    }));
  };

  return {
    bracket,
    updateBracketName,
    addPlayerToBracket,
    removePlayerFromBracket,
    updateMatch,
    generateTournament
  };
};

const buildTournamentTree = (players: Player[], round: number): BracketMatch => {
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

/**
 * Apply proper tournament seeding order where top seeds avoid each other until later rounds
 * For example: 1v8, 2v7, 3v6, 4v5 in first round of 8-player tournament
 */
const applyTournamentSeeding = (rankedPlayers: Player[]): Player[] => {
  const numPlayers = rankedPlayers.length;
  
  // For small tournaments, just return ranked order
  if (numPlayers <= 2) {
    return rankedPlayers;
  }
  
  // Calculate bracket size (next power of 2)
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(numPlayers)));
  
  // Generate seeding pattern for the bracket size
  const seedingOrder = generateSeedingOrder(bracketSize);
  
  // Apply the seeding order to our players
  const seededPlayers: Player[] = [];
  for (let i = 0; i < bracketSize; i++) {
    const seedIndex = seedingOrder[i] - 1; // Convert from 1-based to 0-based
    if (seedIndex < rankedPlayers.length) {
      seededPlayers.push(rankedPlayers[seedIndex]);
    }
  }
  
  return seededPlayers;
};

/**
 * Generate the seeding order for a tournament bracket
 * This ensures top seeds are separated until later rounds
 */
const generateSeedingOrder = (bracketSize: number): number[] => {
  if (bracketSize === 2) {
    return [1, 2];
  }
  
  const halfSize = bracketSize / 2;
  const firstHalf = generateSeedingOrder(halfSize);
  const secondHalf = generateSeedingOrder(halfSize);
  
  // Reverse the second half and add the offset
  const result: number[] = [];
  
  for (let i = 0; i < halfSize; i++) {
    result.push(firstHalf[i]);
    result.push(bracketSize + 1 - secondHalf[i]);
  }
  
  return result;
};
